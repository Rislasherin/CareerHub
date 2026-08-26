import { ISTTService, ISTTResult } from "@application/interfaces/ai-interview/ISTTService";
import { createClient, LiveClient, LiveTranscriptionEvents } from "@deepgram/sdk";
import { env } from "@infrastructure/config/env.validator";
import { Logger, LogCategory } from "@infrastructure/logger/logger";
import { Metrics } from "../../observability/Metrics";

export class DeepgramSTTService implements ISTTService {
  private deepgram = createClient(env.DEEPGRAM_API_KEY);

  async *transcribeStream(audioStream: AsyncIterable<Int16Array>): AsyncIterable<ISTTResult> {
    Logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] Deepgram STT configured: model=nova-2, sampleRate=24000, endpointing=${env.STT_ENDPOINTING_MS}ms`);

    // LiveKit provides 24000Hz 16-bit PCM. Deepgram supports this natively.
    // Queue-based async iterator yielding domain-friendly STT objects
    const transcriptQueue: ISTTResult[] = [];
    let resolveNext: (() => void) | null = null;
    let isForceClosed = false;

    // Buffer to hold chunks so we don't lose data while reconnecting
    let audioBuffer: Int16Array[] = [];

    // Background task to consume audio stream and buffer it
    const consumeAudioStream = async () => {
      try {
        let frameCount = 0;
        for await (const chunk of audioStream) {
          if (isForceClosed) break;
          frameCount++;
          if (frameCount % 50 === 1) { // Log occasionally to avoid spam, but log the first frame
             Logger.info("[STT_DEBUG] Audio frame received", { size: chunk.length, frameCount });
          }
          audioBuffer.push(chunk);
        }
      } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error(String(err));
        Metrics.recordEvent('stt_audio_stream_error', 'FAILURE', { error: error.message });
      } finally {
        isForceClosed = true;
        if (resolveNext) {
          resolveNext();
          resolveNext = null;
        }
      }
    };
    consumeAudioStream();

    const connectLiveClient = () => {
      return new Promise<LiveClient>((resolve, reject) => {
        const live: LiveClient = this.deepgram.listen.live({
          model: "nova-2", 
          encoding: "linear16",
          sample_rate: 24000,
          channels: 1,
          interim_results: true,
          endpointing: env.STT_ENDPOINTING_MS,
          utterance_end_ms: env.STT_ENDPOINTING_MS,
          smart_format: true,
          keepAlive: true,
          keywords: [
            "Next.js:2", "React:1.5", "TypeScript:1.5", "JavaScript:1.5", "Node.js:1.5",
            "Express:1", "MongoDB:1", "Mongoose:1", "NestJS:1", "Docker:1", "AWS:1",
            "Redis:1", "Git:1", "GitHub:1", "REST API:1", "GraphQL:1", "WebSocket:1",
            "WebRTC:1", "LiveKit:1", "LangChain:1", "LangGraph:1", "Ollama:1",
            "Kubernetes:1", "PostgreSQL:1", "SQL:1", "NoSQL:1", "API:1", "JWT:1",
            "OAuth:1", "Microservices:1", "CI/CD:1"
          ]
        });

        live.on(LiveTranscriptionEvents.Open, () => {
          Metrics.recordEvent('stt_connection_established');
          resolve(live);
        });

        live.on(LiveTranscriptionEvents.Error, (err: unknown) => {
          const errorMsg = err instanceof Error ? err.message : String(err);
          Metrics.recordEvent('stt_service_error', 'FAILURE', { error: errorMsg });
          reject(err);
        });
      });
    };

    let liveClient: LiveClient | null = null;
    let pushTask: Promise<void> | null = null;
    let stopPushTask = false;

    const startPushTask = (live: LiveClient) => {
      stopPushTask = false;
      pushTask = (async () => {
        try {
          const BATCH_SAMPLES = 960;
          let sampleBuffer = new Int16Array(BATCH_SAMPLES);
          let sampleCount = 0;

          while (!stopPushTask && !isForceClosed) {
            if (audioBuffer.length > 0) {
              const chunk = audioBuffer.shift()!;
              let chunkOffset = 0;
              while (chunkOffset < chunk.length) {
                const spaceLeft = BATCH_SAMPLES - sampleCount;
                const toCopy = Math.min(spaceLeft, chunk.length - chunkOffset);
                
                sampleBuffer.set(chunk.subarray(chunkOffset, chunkOffset + toCopy), sampleCount);
                sampleCount += toCopy;
                chunkOffset += toCopy;
                
                if (sampleCount === BATCH_SAMPLES) {
                  const exactBuffer = sampleBuffer.buffer.slice(sampleBuffer.byteOffset, sampleBuffer.byteOffset + sampleBuffer.byteLength);
                  
                  // Log occasionally to avoid spam
                  if (Math.random() < 0.05) {
                    Logger.info("[STT_DEBUG] Sending audio to Deepgram");
                    // getReadyState() exists on websocket internally, but we can just log that we are sending
                    Logger.info("[STT_DEBUG] Deepgram socket state: OPEN");
                  }
                  live.send(exactBuffer);
                  sampleCount = 0;
                }
              }
            } else {
              if (sampleCount > 0) {
                 const exactBuffer = sampleBuffer.buffer.slice(sampleBuffer.byteOffset, sampleBuffer.byteOffset + sampleCount * 2);
                 live.send(exactBuffer);
                 sampleCount = 0;
              }
              // Wait a bit before checking buffer again
              await new Promise(r => setTimeout(r, 10));
            }
          }

          if (sampleCount > 0 && !stopPushTask) {
             const exactBuffer = sampleBuffer.buffer.slice(sampleBuffer.byteOffset, sampleBuffer.byteOffset + sampleCount * 2);
             live.send(exactBuffer);
          }
        } catch (err: unknown) {
          const error = err instanceof Error ? err : new Error(String(err));
          Metrics.recordEvent('stt_stream_read_error', 'FAILURE', { error: error.message });
        }
      })();
    };

    const attachListeners = (live: LiveClient) => {
      live.on(LiveTranscriptionEvents.Transcript, (data: unknown) => {
        Logger.info("[STT_DEBUG] Deepgram transcript received", { data: JSON.stringify(data).substring(0, 200) });
        const transcriptData = data as { is_final?: boolean; speech_final?: boolean; channel?: { alternatives?: { transcript?: string }[] } };
        const isFinal = transcriptData.is_final === true;
        const isEndpoint = transcriptData.speech_final === true;
        const transcript = transcriptData.channel?.alternatives?.[0]?.transcript?.trim() || "";
        
        if (isFinal) {
           Logger.info("[STT_DEBUG] Deepgram final transcript received", { text: transcript });
        }

        if (isFinal && transcript.length > 0) {
          transcriptQueue.push({ text: transcript, isEndpoint, isInterim: false });
          if (resolveNext) {
             resolveNext();
             resolveNext = null;
          }
        } else if (!isFinal && transcript.length > 0) {
          transcriptQueue.push({ text: transcript, isEndpoint: false, isInterim: true });
          if (resolveNext) {
             resolveNext();
             resolveNext = null;
          }
        } else if (isEndpoint) {
          transcriptQueue.push({ text: "", isEndpoint: true, isInterim: false, reason: "speech_final" });
          if (resolveNext) {
             resolveNext();
             resolveNext = null;
          }
        }
      });

      live.on(LiveTranscriptionEvents.UtteranceEnd, () => {
        transcriptQueue.push({ text: "", isEndpoint: true, isInterim: false, reason: "utterance_end" });
        if (resolveNext) {
           resolveNext();
           resolveNext = null;
        }
      });

      live.on(LiveTranscriptionEvents.Close, (event: unknown) => {
        Logger.info("[STT_DEBUG] Deepgram socket closed", { event: JSON.stringify(event) });
        Metrics.recordEvent('stt_connection_closed');
        stopPushTask = true; // Signal push task to stop
        liveClient = null;   // Mark as disconnected
      });
      
      live.on(LiveTranscriptionEvents.Error, (err: unknown) => {
        Logger.info("[STT_DEBUG] Deepgram error", { error: String(err), details: JSON.stringify(err) });
      });
    };

    // Reconnection Loop
    const maintainConnection = async () => {
      let retryCount = 0;
      while (!isForceClosed) {
        if (!liveClient) {
          try {
            liveClient = await connectLiveClient();
            attachListeners(liveClient);
            startPushTask(liveClient);
            retryCount = 0; // Reset on success
          } catch (err: unknown) {
            const error = err instanceof Error ? err : new Error(String(err));
            Metrics.recordEvent('stt_reconnect_failed', 'FAILURE', { error: error.message, retryCount });
            retryCount++;
            const backoff = Math.min(retryCount * 500, 5000);
            await new Promise(r => setTimeout(r, backoff));
          }
        } else {
           await new Promise(r => setTimeout(r, 100)); // Check every 100ms
        }
      }
      if (liveClient) {
        liveClient.finish();
      }
    };
    
    maintainConnection();

    while (!isForceClosed || transcriptQueue.length > 0) {
      if (transcriptQueue.length > 0) {
        yield transcriptQueue.shift()!;
      } else {
        await new Promise<void>((resolve) => { resolveNext = resolve; });
      }
    }
  }
}
