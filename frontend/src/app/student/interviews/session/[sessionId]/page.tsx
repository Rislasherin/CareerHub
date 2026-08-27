'use client';

import React, { use, useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { LiveKitRoom, RoomAudioRenderer, useParticipants, useTrackToggle, useRoomContext } from '@livekit/components-react';
import { Track, RoomEvent } from 'livekit-client';
import '@livekit/components-styles';
import { StudentInterviewService } from '@/services/student/interview.service';
import { InterviewUIState, AIConversationState, ITranscriptMessage } from '@/types/ai-interview';
import { DeviceCheckView } from './components/DeviceCheckView';
import { LiveTranscript } from './components/LiveTranscript';
import { AIAvatarVisual } from './components/AIAvatarVisual';
import { InterviewAvatarRenderer } from './components/InterviewAvatarRenderer';
import { CandidateVideoRenderer } from './components/CandidateVideoRenderer';
import { Mic, MicOff, Clock, PhoneOff, CheckCircle2, AlertCircle, RefreshCw, Lock, Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function CustomMicButton({ isEnabled }: { isEnabled: boolean }) {
  const { toggle, enabled } = useTrackToggle({ source: Track.Source.Microphone });
  const isMuted = !enabled;

  if (!isEnabled) {
    return (
      <div className="px-5 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 cursor-not-allowed flex items-center gap-2 shadow-inner">
        <Lock size={16} className="text-slate-600" />
        <span className="text-xs font-extrabold tracking-wide">Microphone Locked</span>
      </div>
    );
  }

  return (
    <button
      onClick={() => toggle()}
      className={`px-6 py-3 rounded-2xl font-bold text-xs transition-all flex items-center gap-2.5 shadow-xl cursor-pointer ${
        !isMuted
          ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30 ring-2 ring-rose-500/50 animate-pulse'
          : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700'
      }`}
    >
      {!isMuted ? <Mic size={16} /> : <MicOff size={16} />}
      <span>{!isMuted ? 'Microphone Active • Click to Mute' : 'Microphone Muted • Click to Speak'}</span>
    </button>
  );
}

interface IRoomContentProps {
  sessionId: string;
  durationMinutes: number;
  initialStartedAt: string | null;
  studentStream: MediaStream | null;
  onExit: () => void;
}

import { useInterviewIntegrityMonitor } from './components/useInterviewIntegrityMonitor';
import { InterviewIntegrityModal } from './components/InterviewIntegrityModal';

function AIInterviewRoomContent({
  sessionId,
  durationMinutes,
  initialStartedAt,
  studentStream,
  onExit,
}: IRoomContentProps) {
  const room = useRoomContext();
  const participants = useParticipants();
  const [uiState, setUiState] = useState<InterviewUIState>('preparing');
  const [startedAt, setStartedAt] = useState<string | null>(initialStartedAt);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  
  const { enabled: micEnabled, toggle: toggleMic } = useTrackToggle({ source: Track.Source.Microphone });
  const { enabled: cameraEnabled, toggle: toggleCamera } = useTrackToggle({ source: Track.Source.Camera });

  const { isIntegrityBlocked, blockingReason, showGazeWarning, clearIntegrityBlock } = useInterviewIntegrityMonitor({
    sessionId,
    isActive: uiState === 'ai_ready' || uiState === 'in_progress',
    cameraEnabled,
    micEnabled,
    studentStream,
  });

  const isCompletedRef = useRef(false);

  const [currentQuestionText, setCurrentQuestionText] = useState<string>('Connecting to AI interviewer...');
  const [transcriptList, setTranscriptList] = useState<ITranscriptMessage[]>([]);
  const [interimText, setInterimText] = useState<string>('');
  const [showExitConfirm, setShowExitConfirm] = useState<boolean>(false);

  const [isReconnecting, setIsReconnecting] = useState<boolean>(false);
  const latestQuestionSeqRef = useRef<number>(0);

  // LiveKit AI participant presence check
  const aiParticipant = participants.find(
    p => p.identity === 'ai-interviewer' || p.name === 'AI Interviewer' || p.identity.includes('ai') || p.identity.includes('worker')
  );

  // Transition from preparing -> ai_ready when AI participant connects
  useEffect(() => {
    if (aiParticipant) {
      if (uiState === 'preparing' || uiState === 'connecting' || uiState === 'ai_joining') {
        setUiState('ai_ready');
      }
    }
  }, [aiParticipant, uiState]);

  // Realtime LiveKit Data Channel Message Listener & Room Reconnection
  useEffect(() => {
    if (!room) return;

    const handleReconnecting = () => {
      console.log('[AI_INTERVIEW] Room reconnecting...');
      setIsReconnecting(true);
    };

    const handleReconnected = () => {
      console.log('[AI_INTERVIEW] Room reconnected successfully.');
      setIsReconnecting(false);
    };

    const handleDisconnected = () => {
      console.log('[AI_INTERVIEW] Room disconnected permanently.');
      setIsReconnecting(false);
      
      if (isCompletedRef.current) {
        console.log('[AI_INTERVIEW] Disconnected cleanly after interview completion.');
        return;
      }

      setUiState('completed'); // Or set a new error state, but 'completed' with an alert is easiest
      // We could use an alert or a specific UI state for disconnection. Let's just alert for now.
      alert("Connection to the interview server was permanently lost. Please refresh or contact support.");
      window.location.href = '/student/interviews';
    };

    const handleDataReceived = (payload: Uint8Array) => {
      try {
        const decoded = new TextDecoder().decode(payload);
        const data = JSON.parse(decoded);

        if (data.type === 'TRANSCRIPT_PARTIAL') {
          setInterimText(data.text || '');
        } else if (data.type === 'TRANSCRIPT_FINAL') {
          setInterimText('');
          if (data.text) {
            setTranscriptList((prev) => [
              ...prev,
              {
                id: `ans-${Date.now()}`,
                speaker: 'STUDENT',
                text: data.text,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
            ]);
          }
        } else if (data.type === 'QUESTION_UPDATED') {
          setInterimText('');
          const seq = data.sequenceNumber ?? (data.timestamp || 0);
          if (seq && seq < latestQuestionSeqRef.current) {
            console.log(`[AI_INTERVIEW] Stale question event rejected (seq: ${seq} < latest: ${latestQuestionSeqRef.current})`);
            return;
          }
          if (seq) {
            latestQuestionSeqRef.current = seq;
          }

          if (data.text) {
            setCurrentQuestionText(data.text);
            setTranscriptList((prev) => {
              const last = prev[prev.length - 1];
              if (last && last.speaker === 'AI' && last.text === data.text) return prev;
              return [
                ...prev,
                {
                  id: `q-${Date.now()}`,
                  speaker: 'AI',
                  text: data.text,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                },
              ];
            });
          }
        } else if (data.type === 'AI_STATE_CHANGED') {
          if (data.state === 'AI_SPEAKING') {
            setUiState('ai_ready');
          } else if (data.state === 'LISTENING') {
            setUiState('in_progress');
          } else if (data.state === 'PROCESSING') {
            setInterimText('');
          } else if (data.state === 'COMPLETED') {
            isCompletedRef.current = true;
            setUiState('completed');
            setTimeLeft(0);
          }
        } else if (data.type === 'INTERVIEW_PHASE_CHANGED') {
          if (data.phase === 'CLOSING') {
            setUiState('ai_ready');
          } else if (data.phase === 'COMPLETED') {
            isCompletedRef.current = true;
            setUiState('completed');
            setTimeLeft(0);
          }
        }
      } catch (err) {
        console.error('[AI_INTERVIEW] Data received error:', err);
      }
    };

    room.on(RoomEvent.DataReceived, handleDataReceived);
    room.on(RoomEvent.Reconnecting, handleReconnecting);
    room.on(RoomEvent.Reconnected, handleReconnected);
    room.on(RoomEvent.Disconnected, handleDisconnected);

    return () => {
      room.off(RoomEvent.DataReceived, handleDataReceived);
      room.off(RoomEvent.Reconnecting, handleReconnecting);
      room.off(RoomEvent.Reconnected, handleReconnected);
      room.off(RoomEvent.Disconnected, handleDisconnected);
    };
  }, [room]);

  // Sync backend session status as fallback polling
  useEffect(() => {
    let isMounted = true;
    const syncStatus = async () => {
      try {
        const data = await StudentInterviewService.getSessionStatus(sessionId);
        if (isMounted && data) {
          if (data.startedAt) setStartedAt(data.startedAt);
          if (data.isCompleted || data.phase === 'COMPLETED') {
            isCompletedRef.current = true;
            setUiState('completed');
            setTimeLeft(0);
          }
          if (data.currentQuestion && currentQuestionText === 'Connecting to AI interviewer...') {
            setCurrentQuestionText(data.currentQuestion);
          }
          if (data.transcript && data.transcript.length > 0 && transcriptList.length === 0) {
            const parsed: ITranscriptMessage[] = [];
            data.transcript.forEach((q, idx) => {
              parsed.push({
                id: `q-${q.id || idx}`,
                speaker: 'AI',
                text: q.text,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              });
              if (q.candidateAnswer) {
                parsed.push({
                  id: `a-${q.id || idx}`,
                  speaker: 'STUDENT',
                  text: q.candidateAnswer,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                });
              }
            });
            setTranscriptList(parsed);
          }
        }
      } catch (err) {}
    };

    syncStatus();
    const interval = setInterval(syncStatus, uiState === 'in_progress' ? 10000 : 3000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [sessionId, uiState, currentQuestionText, transcriptList.length]);

  // Authoritative countdown timer (startedAt + durationMinutes * 60 * 1000)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (uiState === 'in_progress') {
      const updateTimer = () => {
        if (startedAt && durationMinutes) {
          const deadline = new Date(startedAt).getTime() + durationMinutes * 60 * 1000;
          const remaining = Math.max(0, Math.floor((deadline - Date.now()) / 1000));
          setTimeLeft(remaining);
          if (remaining === 0) {
            isCompletedRef.current = true;
            setUiState('completed');
          }
        } else {
          setTimeLeft(prev => (prev === null ? durationMinutes * 60 : Math.max(0, prev - 1)));
        }
      };
      updateTimer();
      interval = setInterval(updateTimer, 1000);
    }
    return () => clearInterval(interval);
  }, [uiState, startedAt, durationMinutes]);

  const conversationState: AIConversationState = useMemo(() => {
    if (uiState === 'ai_ready') return 'AI_SPEAKING';
    if (uiState === 'in_progress') return 'LISTENING';
    return 'READY';
  }, [uiState]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Completion Screen (Full Screen Dedicated)
  if (uiState === 'completed') {
    return (
      <div className="min-h-screen w-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg w-full bg-slate-900 border border-slate-800 p-8 md:p-10 rounded-3xl shadow-2xl flex flex-col items-center"
        >
          <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-2xl flex items-center justify-center mb-5 shadow-inner">
            <CheckCircle2 size={36} />
          </div>
          <h2 className="text-2xl font-black text-white">Interview Completed Successfully</h2>
          <p className="text-slate-400 text-xs md:text-sm mt-2 leading-relaxed max-w-md">
            Thank you for completing your interview. Your responses have been recorded and submitted to the recruitment team for review.
          </p>

          <div className="w-full mt-6 p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50 text-xs text-slate-400 flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Submission confirmed &bull; You may now leave this page</span>
          </div>

          <button
            onClick={() => { window.location.href = '/student/interviews'; }}
            className="mt-6 w-full py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-2xl transition-all shadow-xl shadow-rose-600/25 cursor-pointer"
          >
            Return to My Interviews
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 md:p-6 overflow-hidden select-none font-sans">
      
      {/* Top Header Bar */}
      <header className="h-16 w-full bg-slate-900/90 border border-slate-800/90 px-6 rounded-2xl flex items-center justify-between shadow-xl backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center text-white font-black text-sm shadow-md">
            C
          </div>
          <div>
            <h2 className="text-xs md:text-sm font-black uppercase tracking-wider text-slate-200 flex items-center gap-2">
              CareerHub AI Interview
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] font-bold text-slate-400">
                {uiState === 'in_progress' ? 'Live Session Active' : 'Connecting to AI...'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {timeLeft !== null && (
            <div className="flex items-center gap-2.5 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 shadow-inner">
              <Clock size={16} className={timeLeft < 60 ? 'text-rose-500 animate-pulse' : 'text-slate-400'} />
              <span className={`font-mono font-black text-sm tracking-wider ${timeLeft < 60 ? 'text-rose-500' : 'text-white'}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
          )}

          <button
            onClick={() => setShowExitConfirm(true)}
            className="px-4 py-2 bg-slate-800 hover:bg-rose-950/60 hover:text-rose-400 hover:border-rose-800/60 text-slate-400 text-xs font-bold rounded-xl border border-slate-700/80 transition-all flex items-center gap-2 cursor-pointer"
          >
            <PhoneOff size={14} /> Leave
          </button>
        </div>
      </header>

      {/* Main Grid: AI Stage & Question (Left 65%) + Live Transcript (Right 35%) */}
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-0 my-4">
        
        {/* Left Stage */}
        <div className="lg:col-span-8 flex flex-col gap-4 min-h-0 h-full">
          
          {/* Two-Pane Video Section */}
          <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* AI INTERVIEWER */}
            <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-xl flex flex-col items-center justify-center">
              <InterviewAvatarRenderer />
              <AIAvatarVisual state={conversationState} />
              
              {/* Overlay Label */}
              <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2 z-20">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                <span className="text-[10px] font-black uppercase tracking-wider text-white">AI Interviewer</span>
              </div>
            </div>

            {/* YOU (Candidate) */}
            <div className="relative rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-xl flex flex-col items-center justify-center">
               <CandidateVideoRenderer stream={studentStream} />
               
               {/* Overlay Label */}
               <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2 z-20">
                 <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                 <span className="text-[10px] font-black uppercase tracking-wider text-white">You</span>
               </div>
            </div>

          </div>

          {/* Current Question Box */}
          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl shadow-xl shrink-0">
            <div className="flex items-center gap-2 text-rose-400 mb-1">
              <Sparkles size={13} />
              <span className="text-[10px] font-black uppercase tracking-widest">Current AI Question</span>
            </div>
            <p className="text-sm md:text-base font-extrabold text-white leading-snug">
              {currentQuestionText}
            </p>
          </div>
        </div>

        {/* Right Stage: Live Voice Transcript */}
        <div className="lg:col-span-4 min-h-0 h-full">
          <LiveTranscript messages={transcriptList} isAiSpeaking={conversationState === 'AI_SPEAKING'} interimText={interimText} />
        </div>
      </main>

      {/* Bottom Controls Bar */}
      <footer className="h-16 w-full bg-slate-900/90 border border-slate-800/90 px-6 rounded-2xl flex items-center justify-between shadow-xl backdrop-blur-md shrink-0">
        <CustomMicButton isEnabled={uiState === 'in_progress'} />

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-400 italic">
            {uiState === 'in_progress' ? 'Voice active • Speak clearly into your mic' : 'AI speaking • Microphone standby'}
          </span>
        </div>
      </footer>

      {/* Exit Confirmation Modal */}
      <AnimatePresence>
        {showExitConfirm && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-3xl max-w-sm w-full shadow-2xl text-center space-y-4"
            >
              <div className="w-14 h-14 rounded-2xl bg-rose-950/60 border border-rose-800/50 flex items-center justify-center text-rose-400 mx-auto">
                <AlertCircle size={28} />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Leave Interview?</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Your interview is currently in progress. Leaving early may finalize your score based on current answers.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => setShowExitConfirm(false)}
                  className="py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-colors"
                >
                  Stay in Interview
                </button>
                <button
                  onClick={() => {
                    isCompletedRef.current = true; // prevent false alert on intentional exit
                    setShowExitConfirm(false);
                    onExit();
                  }}
                  className="py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition-colors shadow-lg shadow-rose-600/25"
                >
                  Leave Session
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <InterviewIntegrityModal
        blockingReason={isIntegrityBlocked ? blockingReason : null}
        showGazeWarning={showGazeWarning}
        clearIntegrityBlock={clearIntegrityBlock}
        toggleCamera={toggleCamera}
        toggleMicrophone={toggleMic}
      />

      <RoomAudioRenderer />
    </div>
  );
}

export default function AISessionPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const unwrappedParams = use(params);
  const sessionId = unwrappedParams.sessionId;

  const [step, setStep] = useState<'check' | 'room'>('check');
  const [token, setToken] = useState<string | null>(null);
  const [durationMinutes, setDurationMinutes] = useState<number>(5);
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [studentStream, setStudentStream] = useState<MediaStream | null>(null);

  const fetchSessionInfo = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await StudentInterviewService.getSessionToken(sessionId);
      if (data && data.token) {
        setToken(data.token);
        if (data.durationMinutes) setDurationMinutes(data.durationMinutes);
        if (data.startedAt) setStartedAt(data.startedAt);
      } else {
        setError('Unable to load interview session token.');
      }
    } catch (err: unknown) {
      setError('Unable to reach interview server. Please verify your connection.');
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    if (sessionId) fetchSessionInfo();
  }, [sessionId, fetchSessionInfo]);

  return (
    <div className="min-h-screen w-screen bg-slate-950 text-slate-100 overflow-x-hidden font-sans">
      {loading && (
        <div className="flex flex-col items-center justify-center min-h-screen text-slate-400 gap-4">
          <div className="w-10 h-10 border-2 border-rose-500/20 border-t-rose-500 rounded-full animate-spin" />
          <p className="text-xs font-bold text-slate-500 tracking-wide">Initializing Interview Environment...</p>
        </div>
      )}

      {!loading && error && (
        <div className="flex flex-col items-center justify-center min-h-screen text-center p-6 gap-4 max-w-sm mx-auto">
          <div className="w-14 h-14 bg-rose-950/60 text-rose-400 border border-rose-800/50 rounded-2xl flex items-center justify-center">
            <AlertCircle size={28} />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Connection Error</h3>
            <p className="text-xs text-slate-400 mt-1">{error}</p>
          </div>
          <button
            onClick={fetchSessionInfo}
            className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-rose-600/25 transition-all"
          >
            <RefreshCw size={14} /> Retry Connection
          </button>
        </div>
      )}

      {!loading && !error && step === 'check' && (
        <DeviceCheckView
          durationMinutes={durationMinutes}
          onProceed={(stream) => {
            setStudentStream(stream);
            setStep('room');
          }}
          isJoining={false}
          onCancel={() => {
            window.location.href = '/student/interviews';
          }}
        />
      )}

      {!loading && !error && step === 'room' && token && (
        <LiveKitRoom
          video={false}
          audio={true}
          token={token}
          serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
          connect={true}
        >
          <AIInterviewRoomContent
            sessionId={sessionId}
            durationMinutes={durationMinutes}
            initialStartedAt={startedAt}
            studentStream={studentStream}
            onExit={() => {
              window.location.href = '/student/interviews';
            }}
          />
        </LiveKitRoom>
      )}
    </div>
  );
}
