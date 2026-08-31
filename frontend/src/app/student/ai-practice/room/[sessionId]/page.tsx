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
import { Loader2, AlertCircle, ArrowLeft, Video, Mic, Sparkles } from 'lucide-react';
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
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-100">
        <div className="flex flex-col items-center gap-4 text-center max-w-sm">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Sparkles size={28} className="animate-pulse" />
            </div>
            <Loader2 size={24} className="animate-spin text-indigo-500 absolute -bottom-2 -right-2" />
          </div>
          <div>
            <h2 className="font-extrabold text-xl text-white">Loading Arena</h2>
            <p className="text-xs text-slate-400 mt-1">Initializing practice environment…</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Error state ──
  if (error || !session || !roomData) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-100">
        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 max-w-md w-full text-center flex flex-col items-center gap-5 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-rose-950/60 border border-rose-800/60 flex items-center justify-center text-rose-400">
            <AlertCircle size={28} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Unable to Join Room</h2>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              {error || 'Something went wrong while connecting to the practice room.'}
            </p>
          </div>
          <div className="flex items-center gap-3 w-full pt-2">
            <button
              type="button"
              onClick={() => handleLeave()}
              className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowLeft size={14} /> Back to Arena
            </button>
            <button
              type="button"
              onClick={fetchSessionAndToken}
              className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all cursor-pointer"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-screen bg-slate-950 text-slate-100 overflow-x-hidden font-sans">
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
