import { Room, RoomEvent, RemoteParticipant, AudioSource, LocalAudioTrack, AudioFrame, RemoteTrack, RemoteTrackPublication, RemoteAudioTrack, AudioStream, TrackSource, TrackPublishOptions } from '@livekit/rtc-node';
import { IAudioTransport } from '@application/interfaces/ai-interview/IAudioTransport';
import { Logger, LogCategory } from '../../logger/logger';

export class AIInterviewerAgent implements IAudioTransport {
  private room: Room;
  private audioSource: AudioSource;
  
  // Queue to buffer incoming audio chunks for the STT stream
  private incomingAudioQueue: Int16Array[] = [];
  private resolveNextIncoming: (() => void) | null = null;

  constructor() {
    this.room = new Room();
    this.audioSource = new AudioSource(24000, 1);
  }

  async connect(url: string, token: string, onParticipantConnected: () => void): Promise<void> {
    if (!url || !token) {
      const errMsg = `[AI_WORKER] LiveKit room connection failed: Missing url or token. (url=${!!url}, token=${!!token})`;
      Logger.error(LogCategory.SYSTEM_ERROR, errMsg);
      throw new Error(errMsg);
    }

    Logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] [6] LiveKit room join started`);
    await this.room.connect(url, token);
    Logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] [7] LiveKit room joined`);
    
    const track = LocalAudioTrack.createAudioTrack('ai-voice', this.audioSource);
    await this.room.localParticipant?.publishTrack(track, { name: 'ai-voice', source: TrackSource.SOURCE_MICROPHONE } as unknown as TrackPublishOptions);

    // Listen for student audio tracks
    this.room.on(RoomEvent.TrackSubscribed, (track: RemoteTrack, _pub: RemoteTrackPublication, _participant: RemoteParticipant) => {
      if (track instanceof RemoteAudioTrack) {
        // Fix: Force LiveKit to automatically resample the incoming remote track to 24000Hz, Mono.
        // This resolves the sample-rate mismatch (Deepgram expects 24k, WebRTC defaults to 48k).
        const audioStream = new AudioStream(track, 24000, 1);
        
        // Start consuming the async iterable without blocking the listener
        (async () => {
          let frameCount = 0;
          for await (const frame of audioStream) {
            frameCount++;
            if (frameCount === 1) {
              Logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] DIAGNOSTIC: AudioFrame from LiveKit:`, {
                 sampleRate: frame.sampleRate,
                 channels: frame.channels,
                 samplesPerChannel: frame.samplesPerChannel,
                 data_length: frame.data.length,
                 byte_length: frame.data.byteLength,
                 first_10_samples: Array.from(frame.data.slice(0, 10))
              });
            }

            // Fix: Use new Int16Array(frame.data) to copy ONLY the valid subset of elements.
            // Using frame.data.buffer previously sent the entire underlying pooled ArrayBuffer,
            // wrapping garbage memory and leading to hallucinated text or garbled audio.
            this.incomingAudioQueue.push(new Int16Array(frame.data));
            
            if (this.resolveNextIncoming) {
              this.resolveNextIncoming();
              this.resolveNextIncoming = null;
            }
          }
        })().catch((err) => Logger.error(LogCategory.SYSTEM_ERROR, "[AI_WORKER] Error reading audio stream:", err));
      }
    });

    this.room.on(RoomEvent.ParticipantConnected, (_participant: RemoteParticipant) => {
      Logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] [8] Participant connected/detected (via event)`);
      onParticipantConnected();
    });

    if (this.room.remoteParticipants.size > 0) {
      Logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] [8] Participant connected/detected (already in room)`);
      onParticipantConnected();
    }
  }

  async publishAudioChunk(buffer: Int16Array): Promise<void> {
    const samplesPerFrame = 240;
    for (let i = 0; i < buffer.length; i += samplesPerFrame) {
      const end = Math.min(i + samplesPerFrame, buffer.length);
      const frame = buffer.slice(i, end);
      let finalFrame = frame;
      if (frame.length < samplesPerFrame) {
        finalFrame = new Int16Array(samplesPerFrame);
        finalFrame.set(frame);
      }
      const audioFrame = new AudioFrame(finalFrame, 24000, 1, samplesPerFrame);
      await this.audioSource.captureFrame(audioFrame);
    }
  }

  async waitForPlayout(): Promise<void> {
    await this.audioSource.waitForPlayout();
  }

  // Expose incoming audio as an async iterable
  async *getIncomingAudioStream(): AsyncIterable<Int16Array> {
    while (true) {
      if (this.incomingAudioQueue.length > 0) {
        yield this.incomingAudioQueue.shift()!;
      } else {
        await new Promise<void>((resolve) => { this.resolveNextIncoming = resolve; });
      }
    }
  }

  async publishDataMessage(payload: Record<string, unknown>): Promise<void> {
    try {
      if (this.room && this.room.localParticipant) {
        const payloadBytes = new TextEncoder().encode(JSON.stringify(payload));
        await this.room.localParticipant.publishData(payloadBytes, { reliable: true });
      }
    } catch (err) {
      Logger.error(LogCategory.SYSTEM_ERROR, "[AI_WORKER] Failed to publish data message to room:", err);
    }
  }

  async disconnect(): Promise<void> {
    try {
      Logger.info(LogCategory.SYSTEM_INFO, "[AI_WORKER] Disconnecting from LiveKit room cleanly...");
      if (this.room) {
        await this.room.disconnect();
      }
    } catch (err) {
      Logger.error(LogCategory.SYSTEM_ERROR, "[AI_WORKER] Error during LiveKit room disconnect:", err);
    }
  }
}
