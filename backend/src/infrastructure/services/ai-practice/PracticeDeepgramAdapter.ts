import { IPracticeSTTService, IPracticeSTTResult } from "../../../application/interfaces/ai-practice/IPracticeSTTService";
import { createClient, LiveClient, LiveTranscriptionEvents } from "@deepgram/sdk";
import { env } from "@infrastructure/config/env.validator";
import { Logger, LogCategory } from "@infrastructure/logger/logger";
import { Metrics } from "../../observability/Metrics";

// ─────────────────────────────────────────────────────────────────────────────
// LIFECYCLE STATES
//
//   ACTIVE   — session is running; reconnects allowed on unexpected close
//   STOPPING — stopReconnecting() was called (session completing); no new connects
//   STOPPED  — fully shut down; all loops exited
//
// The maintainConnection() loop exits when lifecycle reaches STOPPING/STOPPED.
// This prevents the infinite reconnect loop observed after session completion.
// ─────────────────────────────────────────────────────────────────────────────
const enum STTLifecycle {
  ACTIVE = "ACTIVE",
  STOPPING = "STOPPING",
  STOPPED = "STOPPED",
}

export class PracticeDeepgramAdapter implements IPracticeSTTService {
  private deepgram = createClient(env.DEEPGRAM_API_KEY);
  private firstAudioSent = false;
  private _lifecycle: STTLifecycle = STTLifecycle.ACTIVE;

  /**
   * Signal that the practice session is ending.
   * After this call, no further reconnect attempts will be made.
   * Idempotent — safe to call multiple times.
   */
  stopReconnecting(): void {
    if (this._lifecycle !== STTLifecycle.STOPPED) {
      this._lifecycle = STTLifecycle.STOPPING;
      Logger.info(
        LogCategory.SYSTEM_INFO,
        `[STT_LIFECYCLE] STOP_RECONNECT — no further Deepgram reconnects will be attempted`
      );
    }
  }

  async *transcribeStream(audioStream: AsyncIterable<Int16Array>): AsyncIterable<IPracticeSTTResult> {
    Logger.info(
      LogCategory.SYSTEM_INFO,
      `[STT_LIFECYCLE] CONNECT — starting Deepgram STT. model=nova-2 sampleRate=24000 endpointing=${env.STT_ENDPOINTING_MS}ms`
    );

    // Reset lifecycle for this stream invocation
    this._lifecycle = STTLifecycle.ACTIVE;
    this.firstAudioSent = false;

    // ── Queue/Iterator plumbing ─────────────────────────────────────────────
    const transcriptQueue: IPracticeSTTResult[] = [];
    let resolveNext: (() => void) | null = null;
    let isForceClosed = false;

    // Buffer to hold audio chunks while Deepgram reconnects
    let audioBuffer: Int16Array[] = [];

    // ── Background: consume LiveKit audio stream → buffer ──────────────────
    const consumeAudioStream = async () => {
      try {
        let frameCount = 0;
        for await (const chunk of audioStream) {
          if (isForceClosed) break;
          frameCount++;
          if (frameCount === 1) {
            Logger.info(LogCategory.SYSTEM_INFO, `[PRACTICE_FLOW] AUDIO_FRAME_RECEIVED (First frame)`);
          }
          if (frameCount % 50 === 1) {
            Logger.info("[STT_DEBUG] Audio frame received", { size: chunk.length, frameCount });
          }
          audioBuffer.push(chunk);
        }
      } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error(String(err));
        Metrics.recordEvent("stt_audio_stream_error", "FAILURE", { error: error.message });
      } finally {
        isForceClosed = true;
        if (resolveNext) {
          resolveNext();
          resolveNext = null;
        }
      }
    };
    consumeAudioStream();

    // ── Deepgram connection factory ─────────────────────────────────────────
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
            "OAuth:1", "Microservices:1", "CI/CD:1",
          ],
        });

        live.on(LiveTranscriptionEvents.Open, () => {
          Metrics.recordEvent("stt_connection_established");
          resolve(live);
        });

        live.on(LiveTranscriptionEvents.Error, (err: unknown) => {
          const errorMsg = err instanceof Error ? err.message : String(err);
          Metrics.recordEvent("stt_service_error", "FAILURE", { error: errorMsg });
          reject(err);
        });
      });
    };

    // ── Audio push task ────────────────────────────────────────────────────
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
          let idleTicks = 0;

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
                  const exactBuffer = sampleBuffer.buffer.slice(
                    sampleBuffer.byteOffset,
                    sampleBuffer.byteOffset + sampleBuffer.byteLength
                  );

                  if (Math.random() < 0.05) {
                    Logger.info("[STT_DEBUG] Sending audio to Deepgram");
                  }
                  if (!this.firstAudioSent) {
                    this.firstAudioSent = true;
                    Logger.info(LogCategory.SYSTEM_INFO, `[PRACTICE_FLOW] DEEPGRAM_AUDIO_SENT (First buffer)`);
                  }
                  live.send(exactBuffer);
                  sampleCount = 0;
                }
              }
            } else {
              if (sampleCount > 0) {
                const exactBuffer = sampleBuffer.buffer.slice(
                  sampleBuffer.byteOffset,
                  sampleBuffer.byteOffset + sampleCount * 2
                );
                live.send(exactBuffer);
                sampleCount = 0;
              }

              // Keepalive to prevent Deepgram's 10-15s idle timeout
              idleTicks++;
              if (idleTicks > 1000) {
                try {
                  live.keepAlive();
                } catch (_e) { /* ignore */ }
                idleTicks = 0;
              }

              await new Promise((r) => setTimeout(r, 10));
            }
          }

          if (sampleCount > 0 && !stopPushTask) {
            const exactBuffer = sampleBuffer.buffer.slice(
              sampleBuffer.byteOffset,
              sampleBuffer.byteOffset + sampleCount * 2
            );
            live.send(exactBuffer);
          }
        } catch (err: unknown) {
          const error = err instanceof Error ? err : new Error(String(err));
          Metrics.recordEvent("stt_stream_read_error", "FAILURE", { error: error.message });
        }
      })();
    };

    // ── Transcript accumulator ─────────────────────────────────────────────
    // Deepgram often sends speech_final=true on a SEPARATE empty event;
    // the text lives on is_final=true/speech_final=false.
    // We accumulate all is_final=true segments and flush on speech_final or utterance_end.
    let finalSegmentAccumulator = "";

    const flushAccumulator = (reason: string) => {
      const accumulated = finalSegmentAccumulator.trim();
      finalSegmentAccumulator = "";
      if (accumulated.length > 0) {
        Logger.info(LogCategory.SYSTEM_INFO, `[INTERVIEW_FLOW] CANDIDATE_TURN_FINALIZED`, {
          accumulatedLength: accumulated.length,
          reason,
          preview: accumulated.substring(0, 80),
        });
        transcriptQueue.push({ text: accumulated, isEndpoint: true, isInterim: false, reason });
        if (resolveNext) {
          resolveNext();
          resolveNext = null;
        }
      } else {
        Logger.info(LogCategory.SYSTEM_INFO, `[INTERVIEW_FLOW] DEEPGRAM_ENDPOINT_EMPTY`, { reason });
      }
    };

    const attachListeners = (live: LiveClient) => {
      live.on(LiveTranscriptionEvents.Transcript, (data: unknown) => {
        Logger.info("[STT_DEBUG] Deepgram transcript received", {
          data: JSON.stringify(data).substring(0, 200),
        });
        const transcriptData = data as {
          is_final?: boolean;
          speech_final?: boolean;
          channel?: { alternatives?: { transcript?: string }[] };
        };
        const isFinal = transcriptData.is_final === true;
        const isSpeechFinal = transcriptData.speech_final === true;
        const transcript = transcriptData.channel?.alternatives?.[0]?.transcript?.trim() || "";

        if (isFinal) {
          Logger.info(LogCategory.SYSTEM_INFO, `[INTERVIEW_FLOW] DEEPGRAM_FINAL_RECEIVED`, {
            text: transcript,
            speech_final: isSpeechFinal,
          });
        }

        if (isFinal && transcript.length > 0) {
          finalSegmentAccumulator = finalSegmentAccumulator
            ? finalSegmentAccumulator + " " + transcript
            : transcript;

          Logger.info(LogCategory.SYSTEM_INFO, `[INTERVIEW_FLOW] TRANSCRIPT_ACCUMULATED`, {
            segment: transcript,
            total: finalSegmentAccumulator.substring(0, 80),
          });

          // Pass through for interim display
          transcriptQueue.push({ text: transcript, isEndpoint: false, isInterim: false });
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
        }

        if (isSpeechFinal) {
          flushAccumulator("speech_final");
        }
      });

      live.on(LiveTranscriptionEvents.UtteranceEnd, () => {
        Logger.info(LogCategory.SYSTEM_INFO, `[INTERVIEW_FLOW] DEEPGRAM_UTTERANCE_END`, {
          accumulated: finalSegmentAccumulator.substring(0, 80),
        });
        flushAccumulator("utterance_end");
      });

      live.on(LiveTranscriptionEvents.Close, (event: unknown) => {
        const ev = event as { code?: number; reason?: string };
        Logger.info("[STT_DEBUG] Deepgram socket closed", {
          code: ev?.code,
          reason: ev?.reason,
          lifecycle: this._lifecycle,
        });
        Metrics.recordEvent("stt_connection_closed", "SUCCESS", { code: ev?.code });
        stopPushTask = true;
        liveClient = null;

        if (this._lifecycle !== STTLifecycle.ACTIVE) {
          Logger.info(
            LogCategory.SYSTEM_INFO,
            `[STT_LIFECYCLE] DISCONNECT — session ending; reconnect suppressed (lifecycle=${this._lifecycle})`
          );
        }
      });

      live.on(LiveTranscriptionEvents.Error, (err: unknown) => {
        Logger.info("[STT_DEBUG] Deepgram error", {
          error: String(err),
          details: JSON.stringify(err),
        });
      });
    };

    // ── Reconnection loop ──────────────────────────────────────────────────
    const maintainConnection = async () => {
      let retryCount = 0;
      while (!isForceClosed) {
        // KEY FIX: stop reconnecting when session is ending/ended
        if (this._lifecycle !== STTLifecycle.ACTIVE) {
          Logger.info(
            LogCategory.SYSTEM_INFO,
            `[STT_LIFECYCLE] STOPPED — exiting reconnect loop (lifecycle=${this._lifecycle})`
          );
          this._lifecycle = STTLifecycle.STOPPED;
          break;
        }

        if (!liveClient) {
          try {
            Logger.info(
              LogCategory.SYSTEM_INFO,
              retryCount === 0
                ? `[STT_LIFECYCLE] CONNECT — establishing Deepgram connection`
                : `[STT_LIFECYCLE] RECONNECT_ATTEMPT — attempt #${retryCount}`
            );
            liveClient = await connectLiveClient();
            attachListeners(liveClient);
            startPushTask(liveClient);
            retryCount = 0;
          } catch (err: unknown) {
            // Only retry if still ACTIVE
            if (this._lifecycle !== STTLifecycle.ACTIVE) {
              Logger.info(LogCategory.SYSTEM_INFO, `[STT_LIFECYCLE] STOPPED — connect failed but session ending; no retry`);
              break;
            }
            const error = err instanceof Error ? err : new Error(String(err));
            Metrics.recordEvent("stt_reconnect_failed", "FAILURE", {
              error: error.message,
              retryCount,
            });
            retryCount++;
            const backoff = Math.min(retryCount * 500, 5000);
            await new Promise((r) => setTimeout(r, backoff));
          }
        } else {
          await new Promise((r) => setTimeout(r, 100));
        }
      }

      // Graceful socket close
      if (liveClient) {
        try {
          liveClient.finish();
        } catch (_e) { /* ignore */ }
      }
      this._lifecycle = STTLifecycle.STOPPED;
      Logger.info(LogCategory.SYSTEM_INFO, `[STT_LIFECYCLE] DISCONNECT — Deepgram socket closed cleanly`);
    };

    maintainConnection();

    // ── Yield transcripts to caller ─────────────────────────────────────────
    while (!isForceClosed || transcriptQueue.length > 0) {
      if (transcriptQueue.length > 0) {
        yield transcriptQueue.shift()!;
      } else {
        await new Promise<void>((resolve) => { resolveNext = resolve; });
      }
    }
  }
}
