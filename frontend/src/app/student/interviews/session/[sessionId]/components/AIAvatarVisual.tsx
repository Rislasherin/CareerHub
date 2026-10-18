'use client';

import React, { useRef, useEffect } from 'react';
import { Bot, Volume2, Mic, Sparkles, User, VideoOff } from 'lucide-react';
import { AIConversationState } from '@/types/ai-interview';
import { motion } from 'framer-motion';

interface IAIAvatarVisualProps {
  state: AIConversationState;
  studentStream?: MediaStream | null;
}

export const AIAvatarVisual: React.FC<IAIAvatarVisualProps> = ({ state }) => {

  const isSpeaking = 
    state === 'AI_SPEAKING' || 
    state === 'INTRO_SPEAKING' || 
    state === 'ASKING_QUESTION';

  const isListening = 
    state === 'LISTENING' || 
    state === 'CANDIDATE_LISTENING' || 
    state === 'WAITING_FOR_CANDIDATE';

  const isProcessing = 
    state === 'PROCESSING' || 
    state === 'CANDIDATE_PROCESSING' || 
    state === 'PROCESSING_ANSWER';

  const isFollowUp = 
    state === 'FOLLOW_UP_PENDING' || 
    state === 'FOLLOW_UP_OR_NEXT_QUESTION';

  const getStatusLabel = () => {
    switch (state) {
      case 'INTRO_SPEAKING': return 'AI interviewer introduction...';
      case 'ASKING_QUESTION': return 'AI is asking question...';
      case 'AI_SPEAKING': return 'AI is speaking...';
      case 'LISTENING':
      case 'CANDIDATE_LISTENING': return 'Listening to you...';
      case 'WAITING_FOR_CANDIDATE': return 'Your turn to speak...';
      case 'PROCESSING':
      case 'CANDIDATE_PROCESSING':
      case 'PROCESSING_ANSWER': return 'Evaluating your response...';
      case 'FOLLOW_UP_PENDING':
      case 'FOLLOW_UP_OR_NEXT_QUESTION': return 'Preparing next question...';
      case 'COMPLETED':
      case 'INTERVIEW_COMPLETED': return 'Interview completed';
      case 'READY': return 'Ready to begin';
      case 'ERROR': return 'Connection issue';
      default: return 'Live Interview Active';
    }
  };

  return (
    <div className="relative aspect-video w-full rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950/40 border border-slate-800 flex flex-col items-center justify-center overflow-hidden shadow-2xl">
      {/* Background Animated Soundwave / Glow */}
      <div className="relative flex items-center justify-center">
        {isSpeaking && (
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 1.6, repeat: Infinity }}
            className="absolute w-40 h-40 rounded-full bg-indigo-500/25 blur-2xl"
          />
        )}
        {isListening && (
          <motion.div
            animate={{ scale: [1, 1.25, 1], opacity: [0.2, 0.6, 0.2] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute w-40 h-40 rounded-full bg-rose-500/25 blur-2xl"
          />
        )}
        {isProcessing && (
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            className="absolute w-40 h-40 rounded-full bg-amber-500/20 blur-2xl"
          />
        )}

        {/* AI Center Sphere */}
        <div className={`w-24 h-24 rounded-3xl flex items-center justify-center shadow-inner border transition-all duration-500 ${
          isSpeaking
            ? 'bg-indigo-600/30 border-indigo-400/50 text-indigo-300 ring-8 ring-indigo-500/10'
            : isListening
            ? 'bg-rose-600/30 border-rose-400/50 text-rose-300 ring-8 ring-rose-500/10'
            : isProcessing || isFollowUp
            ? 'bg-amber-600/20 border-amber-400/40 text-amber-300 ring-8 ring-amber-500/10'
            : 'bg-slate-800/60 border-slate-700 text-slate-400'
        }`}>
          {isSpeaking ? (
            <Volume2 size={44} className="animate-pulse" />
          ) : isListening ? (
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

    </div>
  );
};
