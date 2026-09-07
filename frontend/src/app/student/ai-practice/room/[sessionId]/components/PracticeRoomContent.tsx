'use client';

import React, { useState } from 'react';
import type { RemoteParticipant, RemoteTrack, RemoteTrackPublication, RemoteAudioTrack } from 'livekit-client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  IAIPracticeInterviewResponse,
  IAIPracticeQuestion,
  PracticeInterviewStatus,
} from '@/types/ai-practice';
import { StudentAIPracticeService } from '@/services/student/ai-practice.service';
import { AIQuestionSpeaker } from '../../../components/AIQuestionSpeaker';
import { useRoomContext, useLocalParticipant, useDataChannel, RoomAudioRenderer } from '@livekit/components-react';
import { RoomEvent, Track, ParticipantEvent } from 'livekit-client';
import { PracticeCameraPreview } from './PracticeCameraPreview';
import { PracticeConnectionStatus } from './PracticeConnectionStatus';
import { PracticeAIAvatarVisual } from './PracticeAIAvatarVisual';
import {
  LogOut,
  Bot,
  CheckCircle2,
  Sparkles,
  Award,
  ArrowRight,
  Loader2,
  ChevronDown,
  MessageSquare,
  Clock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';


interface PracticeRoomContentProps {
  session: IAIPracticeInterviewResponse;
  onSessionUpdate: (updated: IAIPracticeInterviewResponse) => void;
  onLeave: (destination?: string) => void;
}

interface PracticeTimerProps {
  durationMinutes: number;
  startedAt?: string;
  onExpire?: () => void;
}

const PracticeTimer: React.FC<PracticeTimerProps> = ({ durationMinutes, startedAt, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState<string>('--:--');
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);

  React.useEffect(() => {
    if (!startedAt) return;
    
    const start = new Date(startedAt).getTime();
    const durationMs = durationMinutes * 60 * 1000;
    const end = start + durationMs;

    const updateTimer = () => {
      const now = Date.now();
      const remainingMs = Math.max(0, end - now);
      
      const secondsLeft = Math.ceil(remainingMs / 1000);
      setRemainingSeconds(secondsLeft);
      
      if (secondsLeft === 0) {
         setTimeLeft("Time's up");
         if (onExpire) onExpire();
      } else {
         const m = Math.floor(secondsLeft / 60);
         const s = secondsLeft % 60;
         setTimeLeft(`${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [startedAt, durationMinutes]);

  let containerClass = "flex items-center gap-2 bg-white/[0.04] px-3.5 py-1.5 rounded-lg border border-white/[0.06]";
  let iconClass = "text-slate-400";
  let textClass = "text-white";

  if (remainingSeconds !== null) {
    if (remainingSeconds === 0) {
      containerClass = "flex items-center gap-2 bg-rose-500/10 px-3.5 py-1.5 rounded-lg border border-rose-500/30";
      iconClass = "text-rose-400";
      textClass = "text-rose-400";
    } else if (remainingSeconds <= 10) {
      containerClass = "flex items-center gap-2 bg-rose-500/15 px-3.5 py-1.5 rounded-lg border border-rose-500/50 shadow-[0_0_15px_rgba(225,29,72,0.25)] animate-pulse";
      iconClass = "text-rose-300";
      textClass = "text-rose-100";
    } else if (remainingSeconds <= 60) {
      containerClass = "flex items-center gap-2 bg-amber-500/10 px-3.5 py-1.5 rounded-lg border border-amber-500/30";
      iconClass = "text-amber-400";
      textClass = "text-amber-400";
    }
  }

  return (
    <div className={containerClass}>
      <Clock size={14} className={iconClass} />
      <span className={`font-mono font-bold text-[13px] tracking-wider ${textClass}`}>
        {timeLeft}
      </span>
    </div>
  );
};

export const PracticeRoomContent: React.FC<PracticeRoomContentProps> = ({
  session,
  onSessionUpdate,
  onLeave,
}) => {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [tabSwitchWarning, setTabSwitchWarning] = useState(false);
  const [eyeContactWarning, setEyeContactWarning] = useState(false);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [transcriptHistory, setTranscriptHistory] = useState<{speaker: string, text: string}[]>([]);
  const submittingLockRef = React.useRef<string | null>(null);
  const isLeavingRef = React.useRef(false);

  const { localParticipant } = useLocalParticipant();
  const room = useRoomContext();

  // ── Leave Interview — navigate first, clean up in background ───────────────
  const handleLeaveWithCleanup = React.useCallback((destination?: string) => {
    if (isLeavingRef.current) return; // prevent double-execution
    isLeavingRef.current = true;
    setIsLeaving(true);

    console.log('[INTERVIEW_CLEANUP] leave requested — navigating immediately');

    // Navigate FIRST so the user is never blocked
    onLeave(destination);

    // Then stop tracks in background (best-effort, no await)
    setTimeout(() => {
      try {
        if (localParticipant) {
          localParticipant.trackPublications.forEach((pub) => {
            try {
              pub.track?.mediaStreamTrack?.stop();
            } catch (_) {}
          });
        }
        if (room && room.state !== 'disconnected') {
          room.disconnect(true).catch(() => {});
        }
        console.log('[INTERVIEW_CLEANUP] background cleanup done');
      } catch (err) {
        console.warn('[INTERVIEW_CLEANUP] background cleanup error:', err);
      }
    }, 100);
  }, [localParticipant, room, onLeave]);

  // ── Cleanup on unexpected unmount (browser back, Next.js route change) ────
  const roomRef = React.useRef(room);
  const localParticipantRef = React.useRef(localParticipant);

  React.useEffect(() => {
    roomRef.current = room;
    localParticipantRef.current = localParticipant;
  }, [room, localParticipant]);

  React.useEffect(() => {
    isLeavingRef.current = false;
    return () => {
      if (!isLeavingRef.current) {
        isLeavingRef.current = true;
        console.log('[INTERVIEW_CLEANUP] component unmounting — running cleanup');
        // Cannot await on unmount — stop tracks synchronously
        localParticipantRef.current?.trackPublications.forEach((pub) => {
          pub.track?.mediaStreamTrack?.stop();
        });
        if (roomRef.current && roomRef.current.state !== 'disconnected') {
          roomRef.current.disconnect(true).catch(() => {});
        }
        console.log('[INTERVIEW_CLEANUP] unmount cleanup completed');
      }
    };
  }, []); // intentionally empty — we want this to run once on unmount with stable refs

  // Tab switch detection
  React.useEffect(() => {
    if (session.status !== PracticeInterviewStatus.IN_PROGRESS) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchWarning(true);
        // Automatically dismiss the warning after 5 seconds if they return
        setTimeout(() => setTabSwitchWarning(false), 5000);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [session.status]);

  // Eye-Contact Coaching using native FaceDetector (Phase 11)
  React.useEffect(() => {
    if (session.status !== PracticeInterviewStatus.IN_PROGRESS || !localParticipant) return;
    
    let active = true;
    let faceDetector: any = null;

    if ('FaceDetector' in window) {
      try {
        // @ts-expect-error - FaceDetector is an experimental web API
        faceDetector = new window.FaceDetector({ fastMode: true, maxDetectedFaces: 1 });
      } catch (e) {
        console.log("FaceDetector not supported or failed to initialize", e);
      }
    }

    if (!faceDetector) return; // Graceful degradation

    const detectFaces = async () => {
      if (!active) return;
      const videoTrack = localParticipant.videoTrackPublications.values().next().value?.videoTrack?.mediaStreamTrack;
      if (!videoTrack || videoTrack.readyState !== 'live') {
        setTimeout(detectFaces, 2000);
        return;
      }
      
      try {
        const imageCapture = new (window as any).ImageCapture(videoTrack);
        const frame = await (imageCapture as any).grabFrame();
        const faces = await faceDetector.detect(frame);
        
        if (faces.length === 0) {
          setEyeContactWarning(true);
          setTimeout(() => setEyeContactWarning(false), 4000);
        }
      } catch (err) {
        // Ignore errors (e.g. ImageCapture not supported or track muted)
      }
      
      if (active) setTimeout(detectFaces, 3000); // Check every 3s
    };

    detectFaces();

    return () => {
      active = false;
    };
  }, [session.status, localParticipant]);

  React.useEffect(() => {
    // Force start AudioContext in case browser Autoplay suspended it due to mic state changes
    if (room && room.canPlaybackAudio === false) {
      room.startAudio().catch(err => console.warn('[PRACTICE_FLOW_FRONTEND] Autoplay failed to start automatically:', err));
    }
  }, [room, isAISpeaking]);

  // ── [AI_AUDIO_DEBUG] Remote audio track tracing ──────────────────────────────
  React.useEffect(() => {
    if (!room) return;

    const handleParticipantConnected = (participant: RemoteParticipant) => {
      console.log(`[AI_AUDIO_DEBUG] remote participant connected`, {
        identity: participant.identity,
        sid: participant.sid,
      });
    };

    const handleTrackPublished = (
      publication: RemoteTrackPublication,
      participant: RemoteParticipant
    ) => {
      console.log(`[AI_AUDIO_DEBUG] remote track published`, {
        identity: participant.identity,
        trackSid: publication.trackSid,
        kind: publication.kind,
        source: publication.source,
        isSubscribed: publication.isSubscribed,
      });
    };

    const handleTrackSubscribed = (
      track: RemoteTrack,
      publication: RemoteTrackPublication,
      participant: RemoteParticipant
    ) => {
      console.log(`[AI_AUDIO_DEBUG] remote track subscribed`, {
        identity: participant.identity,
        trackSid: track.sid,
        kind: track.kind,
        source: publication.source,
      });

      if (track.kind === Track.Kind.Audio) {
        const audioTrack = track as RemoteAudioTrack;
        const el = audioTrack.attach();
        console.log(`[AI_AUDIO_DEBUG] audio element created`, { tagName: el.tagName });
        console.log(`[AI_AUDIO_DEBUG] audio element attached`, { src: el.src ? '[has src]' : '[no src]', muted: el.muted, volume: el.volume });
        // RoomAudioRenderer will manage the actual playback; we log here for diagnostics only.
        // Detach immediately so we don't double-attach; RoomAudioRenderer owns the real elements.
        audioTrack.detach(el);
        el.remove();

        // Probe whether play() would succeed
        const probeEl = document.createElement('audio');
        probeEl.muted = true;
        probeEl.src = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAVFYAAFRWAAABAAgAZGF0YQAAAAA=';
        const playPromise = probeEl.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log(`[AI_AUDIO_DEBUG] play() succeeded — autoplay allowed`, { identity: participant.identity });
              probeEl.remove();
            })
            .catch((err: Error) => {
              console.warn(`[AI_AUDIO_DEBUG] play() failed — autoplay blocked`, { error: err.message, identity: participant.identity });
              probeEl.remove();
              // Attempt to unlock audio context via room
              room.startAudio().catch(() => {});
            });
        } else {
          console.log(`[AI_AUDIO_DEBUG] play() started (no promise — legacy browser)`, { identity: participant.identity });
          probeEl.remove();
        }
      }
    };

    // Log existing remote participants (worker may have joined before us)
    room.remoteParticipants.forEach((participant) => {
      console.log(`[AI_AUDIO_DEBUG] remote participant already present`, {
        identity: participant.identity,
        sid: participant.sid,
      });
      participant.trackPublications.forEach((pub) => {
        console.log(`[AI_AUDIO_DEBUG] existing track publication`, {
          identity: participant.identity,
          trackSid: pub.trackSid,
          kind: pub.kind,
          source: pub.source,
          isSubscribed: pub.isSubscribed,
        });
      });
    });

    room.on(RoomEvent.ParticipantConnected, handleParticipantConnected);
    room.on(RoomEvent.TrackPublished, handleTrackPublished);
    room.on(RoomEvent.TrackSubscribed, handleTrackSubscribed);

    return () => {
      room.off(RoomEvent.ParticipantConnected, handleParticipantConnected);
      room.off(RoomEvent.TrackPublished, handleTrackPublished);
      room.off(RoomEvent.TrackSubscribed, handleTrackSubscribed);
    };
  }, [room]);

  useDataChannel((msg) => {
    try {
      const payload = JSON.parse(new TextDecoder().decode(msg.payload));
      if (payload.event === 'ai_speaking') {
        setIsAISpeaking(true);
        setSubmitting(false);
        if (payload.text) {
          setTranscriptHistory(prev => [...prev, { speaker: 'AI', text: payload.text }]);
        }
      } else if (payload.event === 'state_sync') {
        StudentAIPracticeService.getPractice(session.id).then(res => {
          if (res.success && res.data) {
            onSessionUpdate(res.data);
          }
        }).catch(err => console.error("Error syncing session state:", err));
      } else if (payload.event === 'listening') {
        setIsAISpeaking(false);
        setInterimTranscript('');
      } else if (payload.event === 'interim_transcript') {
        setInterimTranscript(payload.text);
      } else if (payload.event === 'processing_answer') {
        setSubmitting(true);
        setTranscriptHistory(prev => [...prev, { speaker: 'YOU', text: interimTranscript || '[inaudible]' }]);
        setInterimTranscript('');
      }
    } catch (err) {
      console.warn("Error parsing data channel message", err);
    }
  });

  React.useEffect(() => {
    if (localParticipant) {
      const audioPubs = Array.from(localParticipant.audioTrackPublications.values()).map(pub => ({
        trackSid: pub.trackSid,
        source: pub.source,
        kind: pub.kind,
        hasTrack: !!pub.track,
        isMuted: pub.track?.isMuted
      }));

      console.log(`[PRACTICE_FLOW_FRONTEND] LOCAL_PARTICIPANT_CONNECTED`, { 
        identity: localParticipant.identity, 
        isMicrophoneEnabled: localParticipant.isMicrophoneEnabled,
        audioTracks: audioPubs
      });

      const onTrackPublished = (pub: any) => {
        console.log(`[PRACTICE_FLOW_FRONTEND] LOCAL_TRACK_PUBLISHED`, {
          trackSid: pub.trackSid,
          source: pub.source,
          kind: pub.kind,
          hasTrack: !!pub.track
        });
      };
      
      localParticipant.on(ParticipantEvent.LocalTrackPublished, onTrackPublished);

      if (isAISpeaking) {
         localParticipant.setMicrophoneEnabled(false)
           .then(() => console.log(`[PRACTICE_FLOW_FRONTEND] MICROPHONE_MUTED (AI speaking)`))
           .catch(err => console.error(`[PRACTICE_FLOW_FRONTEND] ERROR disabling mic`, err));
      } else {
         localParticipant.setMicrophoneEnabled(true)
           .then(() => console.log(`[PRACTICE_FLOW_FRONTEND] MICROPHONE_ENABLED (Candidate turn)`))
           .catch(err => console.error(`[PRACTICE_FLOW_FRONTEND] ERROR enabling mic`, err));
      }

      return () => {
        localParticipant.off(ParticipantEvent.LocalTrackPublished, onTrackPublished);
      };
    } else {
      console.log(`[PRACTICE_FLOW_FRONTEND] LocalParticipant is undefined...`);
    }
  }, [isAISpeaking, localParticipant]);

  const activeQuestion: IAIPracticeQuestion | undefined =
    session.questions.find((q) => !q.candidateAnswer);
  const answeredCount = session.questions.filter((q) => q.candidateAnswer !== undefined).length;
  const isCompleted = session.status === PracticeInterviewStatus.COMPLETED;
  const answeredQuestions = session.questions.filter((q) => q.candidateAnswer);

  // While submitting: AI is "thinking" — show evaluating overlay
  const isEvaluating = submitting || isTimeUp;

  React.useEffect(() => {
    if (isCompleted) {
      const t = setTimeout(() => {
         handleLeaveWithCleanup(`/student/ai-practice/results/${session.id}`);
      }, 2500);
      return () => clearTimeout(t);
    }
  }, [isCompleted, handleLeaveWithCleanup]);

  // Answer submission is handled entirely by backend processing loop.
  // We only rely on LiveKit data channels for state synchronization.

  // ── Completed View ───────────────────────────────────────────────────────────
  if (isCompleted) {
    return (
      <div className="h-screen w-screen bg-[#0B0B10] flex flex-col items-center justify-center p-6 text-slate-100 relative overflow-hidden">
        <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[560px] h-[560px] rounded-full bg-indigo-600/10 blur-[120px]" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative w-full max-w-md flex flex-col items-center gap-7 p-10 bg-[#131318] border border-white/[0.06] rounded-2xl text-center shadow-2xl"
        >
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mx-auto">
              <Bot size={30} />
            </div>
            <Loader2 size={20} className="animate-spin text-indigo-400 absolute -bottom-1.5 -right-1.5" />
          </div>

          <div className="flex flex-col gap-2.5">
            <h2
              className="text-2xl font-medium text-white"
              style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
            >
              Time&apos;s up
            </h2>
            <p className="text-[15px] text-slate-300 font-medium">
              Your practice interview has ended.
            </p>
            <p className="text-[13px] text-slate-500 leading-relaxed">
              Preparing your results…
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Active Interview View ─────────────────────────────────────────────────────
  return (
    <div className="h-screen w-screen bg-[#0B0B10] text-slate-100 overflow-hidden flex flex-col p-3 md:p-4 gap-3">

      {/* ── Audio Rendering ── */}
      {/*
        RoomAudioRenderer subscribes to all remote audio tracks and attaches each
        to a hidden <audio> element so the browser actually plays them.
        LiveKitRoom audio={true} only controls local mic publication — it does NOT
        auto-play remote tracks. Without this component the AI voice is silently
        discarded even though it arrives at the browser over the LiveKit SFU.
      */}
      <RoomAudioRenderer />

      {/* ── Leave Confirmation Dialog ── */}
      <AnimatePresence>
        {showLeaveConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#131318] border border-white/[0.06] rounded-2xl p-7 max-w-md w-full shadow-2xl flex flex-col gap-5 text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 mx-auto">
                <LogOut size={24} />
              </div>
              <div>
                <h3
                  className="text-lg font-medium text-white"
                  style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
                >
                  Leave mock interview?
                </h3>
                <p className="text-[13px] text-slate-400 mt-1.5 leading-relaxed">
                  Your answered questions and scores will be preserved in your dashboard.
                </p>
              </div>
              <div className="flex items-center gap-3 w-full pt-1">
                <button
                  type="button"
                  onClick={() => setShowLeaveConfirm(false)}
                  className="flex-1 py-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.06] text-slate-300 font-semibold text-[13px] transition-colors cursor-pointer"
                >
                  Stay in room
                </button>
                <button
                  type="button"
                  disabled={isLeaving}
                  onClick={() => handleLeaveWithCleanup()}
                  className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-[13px] transition-colors cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLeaving ? <><Loader2 size={14} className="animate-spin" /> Leaving…</> : 'Leave interview'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Top Header Bar ── */}
      <header className="h-14 w-full bg-[#131318] border border-white/[0.06] px-5 rounded-xl flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
            <Sparkles size={14} />
          </div>
          <div>
            <h2 className="text-[12px] font-semibold text-slate-200 leading-tight">
              AI Practice Interview
            </h2>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] font-medium text-slate-500">
                Live session active
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {session.durationMinutes && (
             <PracticeTimer
                durationMinutes={session.durationMinutes}
                startedAt={session.startedAt}
                onExpire={() => setIsTimeUp(true)}
             />
          )}
          <button
            onClick={() => setShowLeaveConfirm(true)}
            className="px-3.5 py-1.5 bg-white/[0.04] hover:bg-rose-500/10 hover:text-rose-400 text-slate-400 text-[12px] font-semibold rounded-lg border border-white/[0.06] hover:border-rose-500/30 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut size={13} /> Leave
          </button>
        </div>
      </header>

      {/* ── Main Area (fills remaining viewport, no page scroll) ── */}
      <div className="flex-1 min-h-0 flex flex-col gap-3">

        {/* Video Panes */}
        <div className="relative basis-[56%] min-h-0 grid grid-cols-1 md:grid-cols-2 gap-3">

          {/* Tab Switch Warning Overlay */}
          <AnimatePresence>
            {tabSwitchWarning && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute top-3 left-1/2 -translate-x-1/2 z-50 bg-amber-500 text-white px-4 py-2 rounded-full font-semibold text-xs shadow-lg shadow-amber-500/20 flex items-center gap-2"
              >
                <span>⚠️ Tab switch detected. Please stay focused on the interview!</span>
                <button onClick={() => setTabSwitchWarning(false)} className="ml-2 bg-amber-600 px-2 py-0.5 rounded-full hover:bg-amber-700">✕</button>
              </motion.div>
            )}

            {eyeContactWarning && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute top-14 left-1/2 -translate-x-1/2 z-50 bg-indigo-600/90 backdrop-blur-md text-white px-4 py-2 rounded-full font-semibold text-xs shadow-lg shadow-indigo-500/20 flex items-center gap-2 border border-indigo-400/40"
              >
                <span>👁️ Try to maintain eye contact with the camera!</span>
                <button onClick={() => setEyeContactWarning(false)} className="ml-2 bg-indigo-700 px-2 py-0.5 rounded-full hover:bg-indigo-800">✕</button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* AI INTERVIEWER */}
          <div className="relative rounded-2xl overflow-hidden bg-[#131318] border border-white/[0.06] flex flex-col items-center justify-center min-h-0">

            <AnimatePresence>
              {isEvaluating && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-black/80 backdrop-blur-sm rounded-2xl"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="relative">
                      <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
                        <Bot size={26} className="text-indigo-400" />
                      </div>
                      <Loader2 size={16} className="animate-spin text-indigo-400 absolute -bottom-1 -right-1" />
                    </div>
                    <div className="text-center">
                      <p className="text-white font-medium text-[13px]">
                        {isTimeUp ? "Time's up! Preparing your results…" : "Preparing next question…"}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex-1 w-full flex items-center justify-center p-6 min-h-0">
               <PracticeAIAvatarVisual isSpeaking={isAISpeaking} topic={activeQuestion?.topic || session.topics[0]} />
            </div>

            <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10 flex items-center gap-1.5 z-20">
              <span className={`w-1.5 h-1.5 rounded-full ${isAISpeaking ? 'bg-indigo-400 animate-ping' : 'bg-slate-400'}`}></span>
              <span className="text-[10px] font-semibold tracking-wide text-white">AI Interviewer</span>
            </div>
          </div>

          {/* YOU (Candidate) */}
          <div className="relative rounded-2xl overflow-hidden bg-black border border-white/[0.06] flex flex-col items-center justify-center min-h-0">
            <div className="absolute inset-0">
               <PracticeCameraPreview />
            </div>
            <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10 flex items-center gap-1.5 z-20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span className="text-[10px] font-semibold tracking-wide text-white">You</span>
            </div>
          </div>
        </div>

        {/* Question & Transcript Panel */}
        <div className="flex-1 min-h-0 bg-[#131318] border border-white/[0.06] rounded-2xl p-4 md:p-5 flex flex-col gap-3">

           {/* Current Question Box */}
           <div className="flex flex-col gap-2 shrink-0">
             <div className="flex items-center justify-between">
               <span className="text-[10px] font-semibold uppercase tracking-widest text-indigo-400">
                 Question {answeredCount + 1} · {activeQuestion?.topic}
               </span>

               <AnimatePresence mode="wait">
                 {isAISpeaking ? (
                   <motion.span
                     key="ai-turn"
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     className="text-[10px] font-semibold text-indigo-300 bg-indigo-500/10 border border-indigo-500/25 px-2.5 py-1 rounded-full"
                   >
                     AI speaking
                   </motion.span>
                 ) : (
                   <motion.span
                     key="your-turn"
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     className="text-[10px] font-semibold text-emerald-300 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1 rounded-full"
                   >
                     Your turn
                   </motion.span>
                 )}
               </AnimatePresence>
             </div>

             {activeQuestion ? (
               <p
                 className="text-white font-medium text-[16px] md:text-[17px] leading-relaxed bg-black/30 p-3.5 rounded-xl border border-white/[0.05]"
                 style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
               >
                 “{activeQuestion.text}”
               </p>
             ) : (
               <div className="h-12 bg-white/[0.03] rounded-xl border border-white/[0.05] animate-pulse" />
             )}

             {/* Invisible TTS Speaker (Removed to avoid browser fallback) */}
           </div>

           {/* Divider */}
           <div className="h-px w-full bg-white/[0.06] shrink-0" />

           {/* Realtime Transcript Panel — internal scroll only, page never scrolls */}
           <div className="flex flex-col gap-2 flex-1 min-h-0">
             <span className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-500 shrink-0">
               Live transcript
             </span>
             <div className="flex flex-col gap-3 text-[13.5px] leading-relaxed overflow-y-auto flex-1 min-h-0 pr-1">
               {transcriptHistory.map((entry, idx) => (
                 <div key={idx} className="flex flex-col gap-0.5">
                   <span className={`text-[10px] font-semibold tracking-wider ${entry.speaker === 'AI' ? 'text-indigo-400' : 'text-emerald-400'}`}>{entry.speaker}</span>
                   <p className="text-slate-300">{entry.text}</p>
                 </div>
               ))}
               {(interimTranscript || (!isAISpeaking && !isEvaluating)) && (
                 <div className="flex flex-col gap-0.5">
                   <span className="text-[10px] font-semibold tracking-wider text-emerald-400">YOU</span>
                   <p className="text-emerald-300/80 italic">
                     {interimTranscript}
                     {!isAISpeaking && !isEvaluating && (
                       <motion.span
                         className="inline-block w-0.5 h-4 bg-emerald-400 ml-1 align-middle"
                         animate={{ opacity: [1, 0, 1] }}
                         transition={{ duration: 0.9, repeat: Infinity }}
                       />
                     )}
                   </p>
                 </div>
               )}
             </div>
           </div>
        </div>

      </div>

      {/* ── Bottom Controls Bar ── */}
      <footer className="h-12 w-full bg-[#131318] border border-white/[0.06] px-5 rounded-xl flex items-center justify-between shrink-0">
        <PracticeConnectionStatus />
        <span className="text-[11.5px] font-medium text-slate-500 italic">
          {isAISpeaking ? 'AI speaking · microphone standby' : 'Voice active · speak clearly into your mic'}
        </span>
      </footer>

    </div>
  );
};