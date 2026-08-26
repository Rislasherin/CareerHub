import { ITTSService } from "@application/interfaces/ai-interview/ITTSService";
import Cartesia from "@cartesia/cartesia-js";
import { env } from "@infrastructure/config/env.validator";
import { Logger, LogCategory } from "@infrastructure/logger/logger";
import { Metrics } from "../../observability/Metrics";

export class CartesiaTTSService implements ITTSService {
  private cartesia: Cartesia;
  private websocket: unknown | null = null;
  private connectionPromise: Promise<void> | null = null;
  
  private handlers = new Map<string, {
    onChunk: (data: { data: string; context_id: string }) => void;
    onDone: () => void;
    onError: (err: Error) => void;
  }>();

  constructor() {
    this.cartesia = new Cartesia({
      apiKey: env.CARTESIA_API_KEY || process.env.CARTESIA_API_KEY,
    });
  }

  async connect(): Promise<void> {
    if (this.websocket) return;
    if (this.connectionPromise) return this.connectionPromise;

    this.connectionPromise = (async () => {
      const maxAttempts = 3;
      let lastError: Error | null = null;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          const t0 = performance.now();
          this.websocket = await this.cartesia.tts.websocket({
            container: "raw",
            encoding: "pcm_s16le",
            sampleRate: 24000,
          });

          (this.websocket as any).on("chunk", (message: unknown) => {
            const data = typeof message === 'string' ? JSON.parse(message) : message as { data: string; context_id: string };
            const handler = data.context_id ? this.handlers.get(data.context_id) : null;
            if (handler && data.data) {
               handler.onChunk(data);
            }
          });

          (this.websocket as any).on("done", (message: unknown) => {
            const data = message ? (typeof message === 'string' ? JSON.parse(message) : message as { context_id?: string }) : null;
            if (data && data.context_id) {
               const handler = this.handlers.get(data.context_id);
               if (handler) handler.onDone();
            } else {
               for (const handler of this.handlers.values()) {
                   handler.onDone();
               }
            }
          });
          
          (this.websocket as any).on("error", (error: unknown) => {
            const err = error instanceof Error ? error : new Error(String(error));
            Metrics.recordEvent('tts_connection_error', 'FAILURE', { error: err.message });
            for (const handler of this.handlers.values()) {
               handler.onError(err);
            }
          });

          (this.websocket as any).on("close", () => {
            Metrics.recordEvent('tts_connection_closed');
            this.websocket = null;
            this.connectionPromise = null;
          });

          await (this.websocket as any).connect();
          Metrics.recordLatency('tts_connection_established', performance.now() - t0, 'cartesia');
          return; // Success!
        } catch (err: unknown) {
          const error = err instanceof Error ? err : new Error(String(err));
          lastError = error;
          Metrics.recordEvent('tts_connection_failed', 'FAILURE', { error: error.message, attempt });
          this.websocket = null;
          if (attempt < maxAttempts) {
            const backoffMs = attempt * 1000;
            await new Promise(r => setTimeout(r, backoffMs));
          }
        }
      }
      this.connectionPromise = null;
      throw lastError || new Error("Failed to connect to Cartesia TTS after max attempts");
    })();

    return this.connectionPromise;
  }

  async disconnect(): Promise<void> {
    if (this.websocket) {
      if (typeof (this.websocket as any).close === 'function') {
         (this.websocket as any).close();
      } else if (typeof (this.websocket as any).disconnect === 'function') {
         (this.websocket as any).disconnect();
      }
      this.websocket = null;
      this.connectionPromise = null;
      Metrics.recordEvent('tts_connection_closed_explicitly');
    }
  }

  async *generateAudioStream(text: string): AsyncIterable<Int16Array> {
    if (!this.websocket) {
      await this.connect();
    }
    
    const maxAttempts = 3;
    let attempt = 1;

    while (attempt <= maxAttempts) {
      const t0 = performance.now();
      const contextId = `ctx_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const queue: Int16Array[] = [];
      let isFinished = false;
      let resolveNext: (() => void) | null = null;
      let streamError: Error | null = null;
      let firstAudioReceived = false;

      this.handlers.set(contextId, {
         onChunk: (data: { data: string; context_id: string }) => {
            if (!firstAudioReceived) {
              firstAudioReceived = true;
              Metrics.recordLatency('tts_first_audio', performance.now() - t0, 'cartesia');
            }
            const buffer = Buffer.from(data.data, "base64");
            const detachedBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.length);
            queue.push(new Int16Array(detachedBuffer));
            if (resolveNext) resolveNext();
         },
         onDone: () => {
            isFinished = true;
            if (resolveNext) resolveNext();
         },
         onError: (err: Error) => {
            streamError = err;
            isFinished = true;
            if (resolveNext) resolveNext();
         }
      });

      try {
        await (this.websocket as any).send({
          model_id: env.CARTESIA_MODEL_ID,
          transcript: text,
          context_id: contextId,
          voice: {
            mode: "id",
            id: env.CARTESIA_VOICE_ID,
          },
          output_format: {
            container: "raw",
            encoding: "pcm_s16le",
            sample_rate: 24000,
          }
        });

        while (true) {
          if (queue.length > 0) {
            yield queue.shift()!;
          } else if (streamError) {
            Metrics.recordEvent('tts_stream_error', 'FAILURE', { error: (streamError as Error).message });
            throw streamError;
          } else if (isFinished) {
            Metrics.recordLatency('tts_total_duration', performance.now() - t0, 'cartesia');
            return;
          } else {
            await new Promise<void>(resolve => { resolveNext = resolve; });
            resolveNext = null;
          }
        }
      } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error(String(err));
        Metrics.recordEvent('tts_request_failed', 'FAILURE', { error: error.message, attempt });
        this.websocket = null;
        this.connectionPromise = null;
        
        if (firstAudioReceived) {
          // If we already yielded chunks, we can't safely retry without duplicate audio
          throw error;
        }

        if (attempt < maxAttempts) {
          attempt++;
          const backoffMs = attempt * 1000;
          await new Promise(r => setTimeout(r, backoffMs));
          await this.connect(); // Reconnect for the next attempt
        } else {
          throw error;
        }
      } finally {
        this.handlers.delete(contextId);
      }
    }
  }
}
