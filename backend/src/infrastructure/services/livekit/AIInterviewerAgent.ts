import { Room, RoomEvent, RemoteParticipant, AudioSource, LocalAudioTrack, AudioFrame, RemoteTrack, RemoteTrackPublication, RemoteAudioTrack, AudioStream, TrackSource, TrackPublishOptions } from '@livekit/rtc-node';
import { IAudioTransport } from '@application/interfaces/ai-interview/IAudioTransport';
import { env } from "@infrastructure/config/env.validator";
import * as crypto from "crypto";
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

  private pcmRemainder: Int16Array | null = null;
  private streamWriter?: any;
  private _tavusFirstChunkSent = false;
  private _tavusChunksSent = 0;
  private _tavusBytesSent = 0;
  private _tavusLastErrorTime = 0;

  async publishAudioChunk(buffer: Int16Array): Promise<void> {
    if (!buffer || buffer.length === 0) return;

    if (env.AI_AVATAR_ENABLED === 'true' && !this.streamWriter && this.room?.localParticipant) {
      // Safety: Only initialize the stream if the Tavus avatar has actually joined the room.
      // If we initialize too early, the data channel might not reach the avatar.
      let isAvatarPresent = false;
      this.room.remoteParticipants.forEach((p) => {
        if (p.identity === 'tavus-avatar-agent') isAvatarPresent = true;
      });

      if (isAvatarPresent) {
        try {
          Logger.info(LogCategory.SYSTEM_INFO, `[Tavus] Tavus participant detected/available`);
          Logger.info(LogCategory.SYSTEM_INFO, `[Tavus] audio output initialized`);
          this.streamWriter = await this.room.localParticipant.streamBytes({
            name: 'AUDIO_' + crypto.randomUUID().substring(0, 8),
            topic: 'lk.audio_stream',
            destinationIdentities: ['tavus-avatar-agent'],
            attributes: {
              sample_rate: '24000',
              num_channels: '1'
            }
          });
        } catch (err) {
          Logger.error(LogCategory.SYSTEM_ERROR, "[Tavus] audio stream failed to initialize for avatar", err);
        }
      }
    }

    let combined: Int16Array;
    if (this.pcmRemainder && this.pcmRemainder.length > 0) {
      combined = new Int16Array(this.pcmRemainder.length + buffer.length);
      combined.set(this.pcmRemainder, 0);
      combined.set(buffer, this.pcmRemainder.length);
      this.pcmRemainder = null;
    } else {
      combined = buffer;
    }

    const samplesPerFrame = 240; // 10ms frame at 24000Hz
    const completeFramesCount = Math.floor(combined.length / samplesPerFrame);

    for (let i = 0; i < completeFramesCount; i++) {
      const start = i * samplesPerFrame;
      const frameSlice = combined.slice(start, start + samplesPerFrame);
      const audioFrame = new AudioFrame(frameSlice, 24000, 1, samplesPerFrame);
      await this.audioSource.captureFrame(audioFrame);
      
      if (this.streamWriter) {
        if (!this._tavusFirstChunkSent) {
          this._tavusFirstChunkSent = true;
          Logger.info(LogCategory.SYSTEM_INFO, `[Tavus] first AI audio chunk sent`);
        }
        
        this._tavusChunksSent++;
        this._tavusBytesSent += frameSlice.byteLength;
        
        if (this._tavusChunksSent % 100 === 0) {
          Logger.info(LogCategory.SYSTEM_INFO, `[Tavus] audio delivery active: chunks=${this._tavusChunksSent}, bytes=${this._tavusBytesSent}`);
        }

        // Send the exact same 10ms frame to Tavus. Fire-and-forget to avoid blocking real audio.
        this.streamWriter.write(new Uint8Array(frameSlice.buffer, frameSlice.byteOffset, frameSlice.byteLength)).catch((err: any) => {
          const now = Date.now();
          if (now - this._tavusLastErrorTime > 5000) {
             Logger.error(LogCategory.SYSTEM_ERROR, "[Tavus] audio delivery failed", err);
             this._tavusLastErrorTime = now;
          }
        });
      }
    }

    const remainingSamples = combined.length % samplesPerFrame;
    if (remainingSamples > 0) {
      const remainderStart = completeFramesCount * samplesPerFrame;
      this.pcmRemainder = combined.slice(remainderStart);
    }
  }

  async waitForPlayout(): Promise<void> {
    if (this.pcmRemainder && this.pcmRemainder.length > 0) {
      const samplesPerFrame = 240;
      const finalFrame = new Int16Array(samplesPerFrame);
      finalFrame.set(this.pcmRemainder, 0);
      this.pcmRemainder = null;
      const audioFrame = new AudioFrame(finalFrame, 24000, 1, samplesPerFrame);
      await this.audioSource.captureFrame(audioFrame);
      
      if (this.streamWriter) {
        this.streamWriter.write(new Uint8Array(finalFrame.buffer, finalFrame.byteOffset, finalFrame.byteLength)).catch(() => {});
      }
    }
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
      
      if (this.streamWriter) {
        await this.streamWriter.close().catch(() => {});
        Logger.info(LogCategory.SYSTEM_INFO, `[Tavus] audio output closed`);
        this.streamWriter = undefined;
      }

      if (this.room) {
        await this.room.disconnect();
      }
    } catch (err) {
      Logger.error(LogCategory.SYSTEM_ERROR, "[AI_WORKER] Error during LiveKit room disconnect:", err);
    }
  }
}
