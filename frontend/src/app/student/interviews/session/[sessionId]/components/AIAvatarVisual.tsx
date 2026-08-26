'use client';

import React, { useRef, useEffect } from 'react';
import { Bot, Volume2, Mic, Sparkles, User, VideoOff } from 'lucide-react';
import { AIConversationState } from '@/types/ai-interview';
import { motion } from 'framer-motion';

interface IAIAvatarVisualProps {
  state: AIConversationState;
  studentStream?: MediaStream | null;
}

export const AIAvatarVisual: React.FC<IAIAvatarVisualProps> = ({ state, studentStream }) => {
  const studentVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (studentVideoRef.current && studentStream) {
      studentVideoRef.current.srcObject = studentStream;
    }
  }, [studentStream]);

  const getStatusLabel = () => {
    switch (state) {
      case 'AI_SPEAKING': return 'AI is speaking...';
      case 'LISTENING': return 'Listening to you...';
      case 'PROCESSING': return 'Evaluating answer...';
      case 'READY': return 'Your turn to speak';
    }
  };

  return (
    <div className="relative aspect-video w-full rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950/40 border border-slate-800 flex flex-col items-center justify-center overflow-hidden shadow-2xl">
      {/* Background Animated Soundwave / Glow */}
      <div className="relative flex items-center justify-center">
        {state === 'AI_SPEAKING' && (
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 1.6, repeat: Infinity }}
            className="absolute w-40 h-40 rounded-full bg-indigo-500/25 blur-2xl"
          />
        )}
        {state === 'LISTENING' && (
          <motion.div
            animate={{ scale: [1, 1.25, 1], opacity: [0.2, 0.6, 0.2] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute w-40 h-40 rounded-full bg-rose-500/25 blur-2xl"
          />
        )}

        {/* AI Center Sphere */}
        <div className={`w-24 h-24 rounded-3xl flex items-center justify-center shadow-inner border transition-all duration-500 ${
          state === 'AI_SPEAKING'
            ? 'bg-indigo-600/30 border-indigo-400/50 text-indigo-300 ring-8 ring-indigo-500/10'
            : state === 'LISTENING'
            ? 'bg-rose-600/30 border-rose-400/50 text-rose-300 ring-8 ring-rose-500/10'
            : 'bg-slate-800/60 border-slate-700 text-slate-400'
        }`}>
          {state === 'AI_SPEAKING' ? (
            <Volume2 size={44} className="animate-pulse" />
          ) : state === 'LISTENING' ? (
            <Mic size={44} className="animate-pulse" />
          ) : (
            <Bot size={44} />
          )}
        </div>
      </div>

      {/* State Badge */}
      <div className="mt-5 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 shadow-lg">
        <Sparkles size={13} className={state === 'AI_SPEAKING' ? 'text-indigo-400' : 'text-slate-400'} />
        <span className="text-xs font-bold text-slate-200 tracking-wide">{getStatusLabel()}</span>
      </div>

      {/* Top Left AI Identifier Tag */}
      <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-300">CareerHub AI Evaluator</span>
      </div>

      {/* Bottom Right: Student Live Camera Tile (Picture-in-Picture) */}
      <div className="absolute bottom-4 right-4 w-36 sm:w-48 aspect-video rounded-2xl overflow-hidden bg-slate-950 border-2 border-slate-700/80 shadow-2xl shadow-black">
        {studentStream ? (
          <video
            ref={studentVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover -scale-x-100"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 bg-slate-900">
            <User size={20} />
            <span className="text-[9px] font-bold mt-0.5">Camera Off</span>
          </div>
        )}
        <div className="absolute bottom-1.5 left-1.5 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span className="text-[9px] font-black uppercase tracking-wider text-white">You</span>
        </div>
      </div>
    </div>
  );
};
