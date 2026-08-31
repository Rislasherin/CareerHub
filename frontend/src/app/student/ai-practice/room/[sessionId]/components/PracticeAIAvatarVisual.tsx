'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Bot, Sparkles } from 'lucide-react';

interface PracticeAIAvatarVisualProps {
  isSpeaking: boolean;
  topic?: string;
}

export const PracticeAIAvatarVisual: React.FC<PracticeAIAvatarVisualProps> = ({
  isSpeaking,
  topic = 'Technical Interviewer',
}) => {
  return (
    <div className="w-full h-full relative bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/60 overflow-hidden flex flex-col items-center justify-center">
      {/* Background ambient glow */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 pointer-events-none ${
          isSpeaking ? 'opacity-40 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/30 via-transparent to-transparent' : 'opacity-10'
        }`}
      />

      {/* Ripple Rings when speaking */}
      {isSpeaking && (
        <>
          <motion.div
            className="absolute rounded-full border border-indigo-500/40"
            initial={{ width: 80, height: 80, opacity: 0.8 }}
            animate={{ width: 180, height: 180, opacity: 0 }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
          />
          <motion.div
            className="absolute rounded-full border border-violet-500/30"
            initial={{ width: 80, height: 80, opacity: 0.6 }}
            animate={{ width: 230, height: 230, opacity: 0 }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut', delay: 0.45 }}
          />
        </>
      )}

      {/* Center AI Core */}
      <div className="relative z-10 flex flex-col items-center gap-3">
        <div
          className={`w-18 h-18 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-2xl ${
            isSpeaking
              ? 'bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 ring-4 ring-indigo-500/30 shadow-indigo-500/40 scale-105'
              : 'bg-slate-800 border border-slate-700 shadow-black/40'
          }`}
          style={{ width: '72px', height: '72px' }} // w-18 h-18 is not standard tailwind (4.5rem), using style
        >
          <Bot size={34} className={isSpeaking ? 'text-white animate-pulse' : 'text-indigo-400'} />
        </div>
      </div>
    </div>
  );
};
