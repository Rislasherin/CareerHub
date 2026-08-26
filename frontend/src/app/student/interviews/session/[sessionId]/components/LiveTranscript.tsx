'use client';

import React, { useEffect, useRef } from 'react';
import { ITranscriptMessage } from '@/types/ai-interview';
import { MessageSquare, Bot, User, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface ILiveTranscriptProps {
  messages: ReadonlyArray<ITranscriptMessage>;
  isAiSpeaking: boolean;
  interimText?: string;
}

export const LiveTranscript: React.FC<ILiveTranscriptProps> = ({ 
  messages, 
  isAiSpeaking,
  interimText 
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isAiSpeaking, interimText]);

  return (
    <div className="flex flex-col h-full bg-slate-900/95 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-800/80 bg-slate-950/70 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400">
            <MessageSquare size={14} />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-200">Live Transcript</h3>
            <p className="text-[10px] text-slate-500 font-semibold">Real-time Voice Transcription</p>
          </div>
        </div>
        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span> Voice Only
        </span>
      </div>

      {/* Transcript Scroll Area */}
      <div ref={containerRef} className="flex-1 p-4 overflow-y-auto space-y-4 font-sans text-xs scrollbar-thin scrollbar-thumb-slate-800">
        {messages.length === 0 && !interimText ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 text-center py-12 px-4 space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-center text-slate-600">
              <Bot size={24} />
            </div>
            <p className="font-bold text-xs text-slate-400">Live conversation transcribing...</p>
            <p className="text-[11px] text-slate-600 max-w-xs">
              Speak clearly into your microphone. Your answers will appear here in realtime.
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.speaker === 'STUDENT' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.speaker === 'AI' && (
                <div className="w-7 h-7 rounded-xl bg-indigo-900/50 border border-indigo-700/60 flex items-center justify-center text-indigo-300 shrink-0 mt-0.5 shadow-sm">
                  <Bot size={14} />
                </div>
              )}

              <div
                className={`p-3.5 rounded-2xl max-w-[85%] leading-relaxed ${
                  msg.speaker === 'STUDENT'
                    ? 'bg-rose-600 text-white rounded-tr-none font-medium shadow-md shadow-rose-600/10'
                    : 'bg-slate-800/90 border border-slate-700/60 text-slate-200 rounded-tl-none shadow-md'
                }`}
              >
                <div className="flex items-center justify-between gap-4 mb-1 border-b border-white/10 pb-1">
                  <span className="text-[9px] font-black uppercase tracking-widest opacity-75">
                    {msg.speaker === 'STUDENT' ? 'You (Candidate)' : 'AI Interviewer'}
                  </span>
                  <span className="text-[9px] opacity-40 font-mono">{msg.timestamp}</span>
                </div>
                <p className="text-xs leading-relaxed">{msg.text}</p>
              </div>

              {msg.speaker === 'STUDENT' && (
                <div className="w-7 h-7 rounded-xl bg-rose-900/50 border border-rose-700/60 flex items-center justify-center text-rose-300 shrink-0 mt-0.5 shadow-sm">
                  <User size={14} />
                </div>
              )}
            </motion.div>
          ))
        )}

        {/* Interim Candidate Transcript */}
        {interimText && (
          <div className="flex justify-end gap-3 animate-fade-in">
            <div className="p-3.5 rounded-2xl max-w-[85%] bg-rose-950/60 border border-rose-800/60 text-rose-200 rounded-tr-none font-medium shadow-sm">
              <div className="flex items-center justify-between gap-4 mb-1 border-b border-rose-800/40 pb-1">
                <span className="text-[9px] font-black uppercase tracking-widest text-rose-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping"></span> Speaking...
                </span>
              </div>
              <p className="text-xs italic text-rose-100">{interimText}</p>
            </div>
            <div className="w-7 h-7 rounded-xl bg-rose-900/50 border border-rose-700/60 flex items-center justify-center text-rose-300 shrink-0 mt-0.5">
              <User size={14} />
            </div>
          </div>
        )}

        {/* AI Speaking Indicator */}
        {isAiSpeaking && (
          <div className="flex items-center gap-2 text-indigo-400 text-[11px] font-semibold italic pl-10">
            <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></span>
            <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
            <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            <span>AI is speaking...</span>
          </div>
        )}
      </div>
    </div>
  );
};
