'use client';

import React, { use, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { LiveKitRoom } from '@livekit/components-react';
import '@livekit/components-styles';
import { StudentAIPracticeService } from '@/services/student/ai-practice.service';
import {
  IAIPracticeInterviewResponse,
  IPracticeRoomTokenResponse,
  PracticeInterviewStatus,
} from '@/types/ai-practice';
import { PracticeRoomContent } from './components/PracticeRoomContent';
import { PracticeDeviceCheck } from './components/PracticeDeviceCheck';
import { Loader2, AlertCircle, ArrowLeft, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

export default function AIPracticeRoomPage({ params }: PageProps) {
  const { sessionId } = use(params);
  const router = useRouter();

  const [session, setSession] = useState<IAIPracticeInterviewResponse | null>(null);
  const [roomData, setRoomData] = useState<IPracticeRoomTokenResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [step, setStep] = useState<'check' | 'room'>('check');

  const fetchSessionAndToken = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch practice session
      const sessionRes = await StudentAIPracticeService.getPractice(sessionId);
      if (!sessionRes.success || !sessionRes.data) {
        throw new Error(sessionRes.message || 'Practice session not found');
      }

      setSession(sessionRes.data);

      if (sessionRes.data.status === PracticeInterviewStatus.COMPLETED) {
        toast.info('Session is already completed. Redirecting to results…');
        router.replace(`/student/ai-practice/results/${sessionId}`);
        return;
      }

      // 2. Fetch room token
      const tokenRes = await StudentAIPracticeService.getRoomToken(sessionId);
      if (!tokenRes.success || !tokenRes.data?.token) {
        throw new Error(tokenRes.message || 'Failed to generate room token');
      }

      setRoomData(tokenRes.data);
    } catch (err: unknown) {
      const axiosErr = err as { error?: { message?: string }; message?: string };
      const msg = axiosErr?.error?.message ?? axiosErr?.message ?? 'Failed to connect to practice room';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [sessionId, router]);

  useEffect(() => {
    fetchSessionAndToken();
  }, [fetchSessionAndToken]);

  const handleLeave = React.useCallback((destination?: string) => {
    window.location.href = destination || '/student/ai-practice';
  }, []);

  // ── Loading state ──
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0B10] flex flex-col items-center justify-center p-6 text-slate-100 relative overflow-hidden">
        {/* ambient glow */}
        <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[560px] h-[560px] rounded-full bg-indigo-600/10 blur-[120px]" />

        <div className="relative flex flex-col items-center gap-5 text-center max-w-sm">
          <div className="relative flex items-center justify-center">
            <span className="absolute w-20 h-20 rounded-full border border-indigo-500/20 animate-ping" />
            <div className="relative w-16 h-16 rounded-2xl bg-indigo-600/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Sparkles size={26} className="animate-pulse" />
            </div>
          </div>
          <div>
            <h2
              className="font-medium text-xl text-white mb-1.5"
              style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
            >
              Loading arena
            </h2>
            <p className="text-[13px] text-slate-400 flex items-center justify-center gap-2">
              <Loader2 size={13} className="animate-spin text-indigo-400" />
              Initializing your practice environment…
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Error state ──
  if (error || !session || !roomData) {
    return (
      <div className="min-h-screen bg-[#0B0B10] flex flex-col items-center justify-center p-6 text-slate-100 relative overflow-hidden">
        <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[560px] h-[560px] rounded-full bg-rose-600/10 blur-[120px]" />

        <div className="relative p-8 rounded-2xl bg-[#131318] border border-white/[0.06] max-w-md w-full text-center flex flex-col items-center gap-5 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-400">
            <AlertCircle size={26} />
          </div>
          <div>
            <h2
              className="text-lg font-medium text-white mb-1.5"
              style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
            >
              Unable to join room
            </h2>
            <p className="text-[13px] text-slate-400 leading-relaxed">
              {error || 'Something went wrong while connecting to the practice room.'}
            </p>
          </div>
          <div className="flex items-center gap-3 w-full pt-1">
            <button
              type="button"
              onClick={() => handleLeave()}
              className="flex-1 py-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.06] text-slate-300 font-semibold text-[13px] transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowLeft size={14} /> Back to arena
            </button>
            <button
              type="button"
              onClick={fetchSessionAndToken}
              className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[13px] transition-colors cursor-pointer"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-screen bg-[#0B0B10] text-slate-100 overflow-x-hidden font-sans">
      {step === 'check' && (
        <PracticeDeviceCheck
          topic={session.topics[0]}
          difficulty={session.difficulty}
          onProceed={(stream) => {
            // We just move to room, LiveKit will get its own stream
            setStep('room');
          }}
          isJoining={false}
          onCancel={() => handleLeave()}
        />
      )}

      {step === 'room' && roomData.token && (
        <LiveKitRoom
          token={roomData.token}
          serverUrl={roomData.liveKitUrl}
          connect={true}
          audio={true}
          video={true}
          data-lk-theme="default"
          onError={(err) => {
            console.warn('[PracticeRoom] LiveKit connection error:', err);
            toast.error('Connection issue with media server');
          }}
        >
          <PracticeRoomContent
            session={session}
            onSessionUpdate={(updated) => setSession(updated)}
            onLeave={handleLeave}
          />
        </LiveKitRoom>
      )}
    </div>
  );
}