import { ITTSQueue } from "@application/interfaces/ai-interview/ITTSQueue";
import { ITTSService } from "@application/interfaces/ai-interview/ITTSService";
import { IAudioTransport } from "@application/interfaces/ai-interview/IAudioTransport";
import { Logger, LogCategory } from '../../logger/logger';

export class TTSQueueService implements ITTSQueue {
  private queue: { sentence: string; t0: number }[] = [];
  private isProcessing = false;
  private drainPromises: ((value: void | PromiseLike<void>) => void)[] = [];

  constructor(
    private readonly ttsService: ITTSService,
    private readonly audioTransport: IAudioTransport
  ) {}

  public enqueue(sentence: string): void {
    const t0 = performance.now();
    Logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] TTS_AUDIO_QUEUED: "${sentence}"`);
    this.queue.push({ sentence, t0 });
    this.processQueue();
  }

  public isSpeaking(): boolean {
    return this.isProcessing || this.queue.length > 0;
  }

  public clear(): void {
    this.queue = [];
    while (this.drainPromises.length > 0) {
      this.drainPromises.shift()!();
    }
  }

  public async waitForDrain(): Promise<void> {
    if (!this.isSpeaking()) return;
    return new Promise((resolve) => {
      this.drainPromises.push(resolve);
    });
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    while (this.queue.length > 0) {
      const item = this.queue.shift()!;
      const sentence = item.sentence;
      const t0 = item.t0;
      const t1 = performance.now();
      
      Logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] TTS_AUDIO_RECEIVED: Processing "${sentence}"`);
      
        let success = false;
        const maxRetries = 2;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          try {
            const t2 = performance.now();
            const audioStream = this.ttsService.generateAudioStream(sentence);
            let hasChunks = false;
            let t4 = 0;
            
            for await (const chunk of audioStream) {
              if (!hasChunks) {
                 t4 = performance.now(); // FIRST audio chunk received
                 Logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] Cartesia audio started for sentence`);
                 hasChunks = true;
              }
              await this.audioTransport.publishAudioChunk(chunk);
            }
            
            if (hasChunks && this.audioTransport.waitForPlayout) {
              await this.audioTransport.waitForPlayout();
            }
            
            const t6 = performance.now(); // TTS sentence completed

            if (hasChunks) {
              Logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] TTS_AUDIO_PUBLISHED`);
              Logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] TTS latency:`);
              Logger.info(LogCategory.SYSTEM_INFO, `sentence_to_tts_start=${(t1 - t0).toFixed(2)}ms`);
              Logger.info(LogCategory.SYSTEM_INFO, `tts_start_to_first_audio=${(t4 - t2).toFixed(2)}ms`);
              Logger.info(LogCategory.SYSTEM_INFO, `first_audio_to_publish=0.00ms`); // Immediate
              Logger.info(LogCategory.SYSTEM_INFO, `total_tts_duration=${(t6 - t1).toFixed(2)}ms`);
              Logger.info(LogCategory.SYSTEM_INFO, `sentence_to_first_audio=${(t4 - t0).toFixed(2)}ms`);
            }
            Logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] TTS sentence completed`);
            success = true;
            break;
          } catch (err) {
            Logger.warn(LogCategory.SYSTEM_INFO, `[AI_WORKER] [TTS_FAILURE] Attempt ${attempt}/${maxRetries} failed for sentence: "${sentence}"`, err);
            if (attempt < maxRetries) {
              await new Promise(r => setTimeout(r, 300));
            }
          }
        }
        if (!success) {
          Logger.error(LogCategory.SYSTEM_ERROR, `[AI_WORKER] [TTS_FAILURE] All ${maxRetries} attempts failed for sentence: "${sentence}". Continuing queue drain safely.`);
        }
    }

    this.isProcessing = false;
    while (this.drainPromises.length > 0) {
      this.drainPromises.shift()!();
    }
  }
}
