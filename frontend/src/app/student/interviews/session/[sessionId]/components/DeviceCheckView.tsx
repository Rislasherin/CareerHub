'use client';

import React, { useRef, useEffect } from 'react';
import { useMediaDeviceCheck } from '@/hooks/useMediaDeviceCheck';
import { Camera, Mic, Clock, ShieldCheck, VideoOff, RefreshCw, ArrowRight, CheckCircle2, ArrowLeft, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface IDeviceCheckViewProps {
  durationMinutes: number;
  onProceed: (stream: MediaStream | null) => void;
  isJoining: boolean;
  onCancel: () => void;
}

export const DeviceCheckView: React.FC<IDeviceCheckViewProps> = ({
  durationMinutes,
  onProceed,
  isJoining,
  onCancel,
}) => {
  const { status, retry, transferStream, stopTracks } = useMediaDeviceCheck();
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current && status.stream) {
      videoRef.current.srcObject = status.stream;
    }
  }, [status.stream]);

  const isReady = status.cameraPermission === 'granted' && status.microphonePermission === 'granted';

  const handleCancel = () => {
    stopTracks();
    onCancel();
  };

  const handleProceed = () => {
    const stream = transferStream() || status.stream;
    onProceed(stream);
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col justify-between p-6 md:p-10 font-sans selection:bg-rose-500 selection:text-white">
      {/* Top Bar */}
      <header className="flex items-center justify-between max-w-6xl mx-auto w-full pb-6 border-b border-slate-900">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-rose-600/30">
            C
          </div>
          <div>
            <span className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1.5">
              CareerHub <span className="text-slate-600">•</span> <span className="text-rose-400 font-bold">AI Interview</span>
            </span>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">System Setup & Verification</p>
          </div>
        </div>

        <button
          onClick={handleCancel}
          className="text-xs font-bold text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-slate-900 border border-transparent hover:border-slate-800"
        >
          <ArrowLeft size={14} /> Exit Setup
        </button>
      </header>

      {/* Main Setup Content */}
      <main className="max-w-6xl mx-auto w-full py-8 my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left: Large Video Preview Card */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="relative aspect-video w-full rounded-3xl overflow-hidden bg-slate-900 border-2 border-slate-800/80 shadow-2xl shadow-black/80 flex items-center justify-center group">
              {status.stream ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover -scale-x-100"
                />
              ) : (
                <div className="flex flex-col items-center gap-4 text-slate-400 p-8 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-500">
                    <VideoOff size={32} className="animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-300">Camera preview unavailable</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs">
                      {status.error || 'Please grant camera & microphone permissions to begin your interview.'}
                    </p>
                  </div>
                  <button
                    onClick={retry}
                    className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-rose-600/20 flex items-center gap-2"
                  >
                    <RefreshCw size={14} /> Allow Device Access
                  </button>
                </div>
              )}

              {/* Status Badge on Video */}
              {status.stream && (
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full flex items-center gap-2 border border-white/10 shadow-lg">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
                  <span className="text-xs font-bold text-white tracking-wide">Live Camera Feed</span>
                </div>
              )}
            </div>

            {/* Hardware Status Chips */}
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-2xl border flex items-center gap-3.5 transition-all ${
                status.cameraPermission === 'granted'
                  ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-300'
                  : 'bg-rose-950/30 border-rose-800/50 text-rose-300'
              }`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  status.cameraPermission === 'granted' ? 'bg-emerald-900/50 text-emerald-400' : 'bg-rose-900/50 text-rose-400'
                }`}>
                  <Camera size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Camera</p>
                  <p className="text-xs font-bold">{status.cameraPermission === 'granted' ? 'Connected & Ready' : 'Permission Required'}</p>
                </div>
              </div>

              <div className={`p-4 rounded-2xl border flex items-center gap-3.5 transition-all ${
                status.microphonePermission === 'granted'
                  ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-300'
                  : 'bg-rose-950/30 border-rose-800/50 text-rose-300'
              }`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  status.microphonePermission === 'granted' ? 'bg-emerald-900/50 text-emerald-400' : 'bg-rose-900/50 text-rose-400'
                }`}>
                  <Mic size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Microphone</p>
                  <p className="text-xs font-bold">{status.microphonePermission === 'granted' ? 'Connected & Ready' : 'Permission Required'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Info & Join Action */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold">
                <Sparkles size={13} />
                <span>AI Technical Round</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                Get ready for your AI interview
              </h2>
              <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
                Your answers will be evaluated directly through voice analysis. Make sure you are prepared before entering the room.
              </p>
            </div>

            {/* Duration Card */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-950/60 border border-rose-800/50 flex items-center justify-center text-rose-400">
                  <Clock size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Scheduled Duration</p>
                  <p className="text-sm font-extrabold text-white">{durationMinutes} Minutes</p>
                </div>
              </div>
              <span className="font-mono text-sm font-black text-rose-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                {String(durationMinutes).padStart(2, '0')}:00
              </span>
            </div>

            {/* Instructions */}
            <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-3">
              <p className="text-xs font-extrabold text-slate-300 flex items-center gap-2">
                <ShieldCheck size={16} className="text-teal-400" /> Ground Rules:
              </p>
              <ul className="text-xs font-medium text-slate-400 space-y-2 pl-1">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={14} className="text-teal-400 shrink-0 mt-0.5" />
                  <span>Stay in a quiet, well-lit space without background noise.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={14} className="text-teal-400 shrink-0 mt-0.5" />
                  <span>Speak clearly; questions and answers transcribe in realtime.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={14} className="text-teal-400 shrink-0 mt-0.5" />
                  <span>Voice only: all questions are answered by speaking into your mic.</span>
                </li>
              </ul>
            </div>

            {/* Join CTA */}
            <button
              onClick={handleProceed}
              disabled={!isReady || isJoining}
              className="w-full py-4 bg-rose-600 hover:bg-rose-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-extrabold text-sm rounded-2xl transition-all shadow-xl shadow-rose-600/25 disabled:shadow-none flex items-center justify-center gap-2.5 cursor-pointer disabled:cursor-not-allowed"
            >
              {isJoining ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Entering Interview Room...
                </span>
              ) : (
                <>
                  Join Interview <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-slate-600 text-[11px] font-semibold pt-4 border-t border-slate-900 max-w-6xl mx-auto w-full">
        Powered by CareerHub Real-time AI Evaluation Pipeline &bull; Secure Encrypted Session
      </footer>
    </div>
  );
};
