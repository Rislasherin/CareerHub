import { Room, RoomEvent, RemoteParticipant, AudioSource, LocalAudioTrack, AudioFrame, RemoteTrack, RemoteTrackPublication, RemoteAudioTrack, AudioStream, TrackSource, TrackPublishOptions, TrackKind } from '@livekit/rtc-node';
import { IPracticeAudioTransport } from "../../../application/interfaces/ai-practice/IPracticeAudioTransport";
import { env } from "@infrastructure/config/env.validator";
import * as crypto from "crypto";
import { Logger, LogCategory } from '../../logger/logger';

export class PracticeLiveKitAdapter implements IPracticeAudioTransport {
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

    // Guard: ensure the callback only fires once even if both the event handler
    // and the "already in room" path trigger for the same participant.
    let participantCallbackFired = false;
    const safeOnParticipantConnected = () => {
      if (participantCallbackFired) {
        Logger.info(LogCategory.SYSTEM_INFO, `[PRACTICE_FLOW] PARTICIPANT_CALLBACK_ALREADY_FIRED — skipping duplicate`);
        return;
      }
      participantCallbackFired = true;
      Promise.resolve().then(() => onParticipantConnected()).catch((err) => {
        Logger.error(LogCategory.SYSTEM_ERROR, `[PRACTICE_FLOW] onParticipantConnected threw an error:`, err);
      });
    };

    const handleTrackSubscribed = (track: RemoteTrack, _pub: RemoteTrackPublication, participant: RemoteParticipant) => {
      Logger.info(LogCategory.SYSTEM_INFO, `[PRACTICE_FLOW] TRACK_SUBSCRIBED_EVENT`, {
         identity: participant.identity,
         trackSid: track.sid,
         trackKind: track.kind,
         trackSource: (track as any).source
      });

      if (track.kind === TrackKind.KIND_AUDIO && track instanceof RemoteAudioTrack) {
        Logger.info(LogCategory.SYSTEM_INFO, `[PRACTICE_FLOW] CANDIDATE_AUDIO_TRACK_FOUND`, {
           identity: participant.identity,
           trackSid: track.sid
        });
        const audioStream = new AudioStream(track, 24000, 1);
        
        (async () => {
          let frameCount = 0;
          for await (const frame of audioStream) {
            frameCount++;
            if (frameCount === 1) {
              Logger.info(LogCategory.SYSTEM_INFO, `[PRACTICE_FLOW] AUDIO_FRAME_RECEIVED (First frame)`, {
                 sampleRate: frame.sampleRate,
                 channels: frame.channels,
                 samplesPerChannel: frame.samplesPerChannel,
                 identity: participant.identity
              });
            }

            this.incomingAudioQueue.push(new Int16Array(frame.data));
            
            if (this.resolveNextIncoming) {
              this.resolveNextIncoming();
              this.resolveNextIncoming = null;
            }
          }
        })().catch((err) => Logger.error(LogCategory.SYSTEM_ERROR, "[AI_WORKER] Error reading audio stream:", err));
      } else {
        Logger.info(LogCategory.SYSTEM_INFO, `[PRACTICE_FLOW] TRACK_IGNORED (Not remote audio track)`, {
           trackKind: track.kind,
           isRemoteAudioTrack: track instanceof RemoteAudioTrack
        });
      }
    };

    // Listen for student audio tracks
    this.room.on(RoomEvent.TrackSubscribed, handleTrackSubscribed);

    this.room.on(RoomEvent.TrackPublished, (publication: RemoteTrackPublication, participant: RemoteParticipant) => {
      Logger.info(LogCategory.SYSTEM_INFO, `[PRACTICE_FLOW] TRACK_PUBLISHED`, {
         identity: participant.identity,
         trackSid: publication.sid,
         kind: publication.kind,
         source: publication.source,
         isSubscribed: publication.subscribed
      });
    });

    this.room.on(RoomEvent.ParticipantConnected, (participant: RemoteParticipant) => {
      Logger.info(LogCategory.SYSTEM_INFO, `[PRACTICE_FLOW] REMOTE_PARTICIPANT_CONNECTED`, { identity: participant.identity });
      safeOnParticipantConnected();
    });

    Logger.info(LogCategory.SYSTEM_INFO, `[PRACTICE_FLOW] LIVEKIT_JOINING`);
    await this.room.connect(url, token);
    Logger.info(LogCategory.SYSTEM_INFO, `[PRACTICE_FLOW] LIVEKIT_JOINED`);
    
    const track = LocalAudioTrack.createAudioTrack('ai-voice', this.audioSource);
    await this.room.localParticipant?.publishTrack(track, { name: 'ai-voice', source: TrackSource.SOURCE_MICROPHONE } as unknown as TrackPublishOptions);

    if (this.room.remoteParticipants.size > 0) {
      Logger.info(LogCategory.SYSTEM_INFO, `[PRACTICE_WORKER] Participant connected (already in room)`);
      this.room.remoteParticipants.forEach(p => {
        Logger.info(LogCategory.SYSTEM_INFO, `[PRACTICE_FLOW] REMOTE_PARTICIPANT_CONNECTED (existing)`, { identity: p.identity });
        
        let foundAudio = false;
        p.trackPublications.forEach((pub: any) => {
           Logger.info(LogCategory.SYSTEM_INFO, `[PRACTICE_FLOW] EXAMINING_EXISTING_TRACK`, {
              identity: p.identity,
              trackSid: pub.sid,
              kind: pub.kind,
              source: pub.source,
              isSubscribed: pub.subscribed
           });
           
           if (pub.subscribed && pub.track && pub.track instanceof RemoteAudioTrack) {
               foundAudio = true;
               handleTrackSubscribed(pub.track as RemoteAudioTrack, pub as RemoteTrackPublication, p);
           } else if (!pub.subscribed && pub.kind === 'audio') {
               Logger.info(LogCategory.SYSTEM_INFO, `[PRACTICE_FLOW] FORCING_SUBSCRIPTION_ON_EXISTING_TRACK`, { trackSid: pub.sid });
               pub.setSubscribed(true); // Ensure we subscribe if not already
           }
        });

        if (!foundAudio) {
           Logger.info(LogCategory.SYSTEM_INFO, `[PRACTICE_FLOW] NO_SUBSCRIBED_AUDIO_TRACK_FOUND_FOR_EXISTING_PARTICIPANT`, { identity: p.identity });
        }
      });
      safeOnParticipantConnected();
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
      
      if (!this._tavusFirstChunkSent) {
         this._tavusFirstChunkSent = true;
         Logger.info(LogCategory.SYSTEM_INFO, `[PRACTICE_FLOW] AI_AUDIO_PUBLISHED (First chunk)`);
      }
      this._tavusChunksSent++;
      this._tavusBytesSent += frameSlice.byteLength;
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
    }
    await this.audioSource.waitForPlayout();
    this._tavusFirstChunkSent = false;
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
