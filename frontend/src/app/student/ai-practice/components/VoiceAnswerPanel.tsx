'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, RotateCcw, Send, AlertCircle, Globe2, Lock, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/shared/Button';
import { usePracticeSpeech } from '../hooks/usePracticeSpeech';

interface VoiceAnswerPanelProps {
  /** Called once the student's answer is finalized (either automatically after silence or manually) */
  onSubmit: (transcript: string) => Promise<void>;
  /** Whether the parent is currently evaluating/submitting the answer to the backend */
  isSubmitting: boolean;
  /** Whether the AI is currently speaking the question */
  isAISpeaking?: boolean;
  /** Unique ID of the current active question */
  questionId?: string;
}

const MIN_ANSWER_LENGTH = 10;

/**
 * VoiceAnswerPanel
 *
 * Conversational voice recording UI for the Student AI Practice mock interview.
 * Automatically detects natural pauses at the end of speech, provides a silence
 * countdown indicator, and auto-submits. Also retains manual "Finish Answer Now"
 * and "Re-record" overrides.
 */
export const VoiceAnswerPanel: React.FC<VoiceAnswerPanelProps> = ({
  onSubmit,
  isSubmitting,
  isAISpeaking = false,
  questionId,
}) => {
  const {
    transcript,
    interimTranscript,
    combinedText,
    state,
    isListening,
    isFinishing,
    isSupported,
    error,
    countdownSeconds,
    startListening,
    stopListening,
    forceSubmit,
    reset,
  } = usePracticeSpeech({
    onAutoSubmit: onSubmit,
    isAISpeaking,
    silenceDelayMs: 2600,
    minChars: MIN_ANSWER_LENGTH,
    minWords: 3,
    questionId,
  });


  const hasAnswer = transcript.trim().length >= MIN_ANSWER_LENGTH;
  const isBusy = isSubmitting || state === 'submitting';
  const isDisabled = isBusy || isAISpeaking;

  const handleMicToggle = () => {
    if (isDisabled) return;
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleManualSubmit = () => {
    if (isDisabled || !hasAnswer) return;
    forceSubmit();
  };

  const handleReRecord = () => {
    if (isBusy) return;
    reset();
    if (!isAISpeaking) {
      startListening();
    }
  };

  // ── Unsupported browser fallback ──────────────────────────────────────────

  if (!isSupported) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 px-6 rounded-2xl border-2 border-dashed border-amber-800/40 bg-amber-950/20 text-center">
        <Globe2 size={32} className="text-amber-400" />
        <div>
          <p className="font-bold text-amber-200 text-sm">Voice recognition isn't supported in this browser</p>
          <p className="text-amber-400/80 text-xs mt-1 max-w-xs">
            Please use <strong>Google Chrome</strong> or <strong>Microsoft Edge</strong> for the full conversational mock interview experience.
          </p>
        </div>
      </div>
    );
  }

  // ── Main panel ─────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-5">
      {/* Mic Button & Status Indicator */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative flex items-center justify-center">
          {/* Animated pulses while listening */}
          <AnimatePresence>
            {isListening && !isAISpeaking && (
              <>
                <motion.div
                  key="ring1"
                  className="absolute rounded-full border-2 border-rose-500/30"
                  initial={{ width: 88, height: 88, opacity: 0.8 }}
                  animate={{ width: 140, height: 140, opacity: 0 }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut' }}
                />
                <motion.div
                  key="ring2"
                  className="absolute rounded-full border-2 border-rose-500/20"
                  initial={{ width: 88, height: 88, opacity: 0.6 }}
                  animate={{ width: 175, height: 175, opacity: 0 }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut', delay: 0.35 }}
                />
              </>
            )}
          </AnimatePresence>

          <button
            id="voice-mic-btn"
            type="button"
            onClick={handleMicToggle}
            disabled={isDisabled}
            aria-label={
              isAISpeaking
                ? 'Microphone locked while AI is speaking'
                : isListening
                ? 'Microphone active — click to pause'
                : 'Click to start speaking'
            }
            className={`relative w-[88px] h-[88px] rounded-full flex items-center justify-center shadow-xl transition-all duration-300 cursor-pointer disabled:cursor-not-allowed ${
              isAISpeaking
                ? 'bg-slate-800 text-slate-500 border border-slate-700 opacity-60 shadow-none'
                : isBusy
                ? 'bg-indigo-900 text-indigo-300 border border-indigo-700 animate-pulse'
                : isFinishing
                ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-500/40 text-white ring-4 ring-amber-500/30'
                : isListening
                ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-500/40 ring-4 ring-rose-500/30 text-white'
                : combinedText
                ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/40 text-white'
                : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/40 text-white ring-4 ring-indigo-500/20'
            }`}
          >
            {isAISpeaking ? (
              <Lock size={28} className="text-slate-400" />
            ) : isBusy ? (
              <Loader2 size={32} className="animate-spin text-white" />
            ) : isListening ? (
              <MicOff size={32} className="text-white" />
            ) : (
              <Mic size={32} className="text-white" />
            )}
          </button>
        </div>

        {/* Dynamic Status Pill */}
        <AnimatePresence mode="wait">
          {isAISpeaking && (
            <motion.p
              key="ai-speaking"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="text-indigo-300 font-bold text-xs flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-950/70 border border-indigo-800/60 shadow-md backdrop-blur-md"
            >
              <Lock size={12} className="text-indigo-400" />
              AI is asking the question… Mic unlocks automatically
            </motion.p>
          )}

          {!isAISpeaking && isFinishing && countdownSeconds !== null && (
            <motion.p
              key="finishing"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="text-amber-300 font-bold text-xs flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-950/70 border border-amber-700/60 shadow-md backdrop-blur-md animate-pulse"
            >
              <Sparkles size={13} className="text-amber-400" />
              Finalizing answer in {countdownSeconds}s… (speak to continue)
            </motion.p>
          )}

          {!isAISpeaking && !isFinishing && isListening && (
            <motion.p
              key="listening"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="text-rose-300 font-bold text-xs flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-950/70 border border-rose-800/60 shadow-md backdrop-blur-md"
            >
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
              Listening… Speak your answer naturally
            </motion.p>
          )}

          {!isAISpeaking && isBusy && (
            <motion.p
              key="evaluating"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="text-indigo-300 font-bold text-xs flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-950/70 border border-indigo-800/60 shadow-md backdrop-blur-md"
            >
              <Loader2 size={13} className="animate-spin text-indigo-400" />
              Evaluating answer with AI… Next question coming up
            </motion.p>
          )}

          {!isAISpeaking && !isListening && !isBusy && !combinedText && !error && (
            <motion.p
              key="idle"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="text-emerald-300 font-bold text-xs flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/70 border border-emerald-800/60 shadow-md backdrop-blur-md"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Your turn — Speak your response aloud
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Error display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="flex items-start gap-3 p-4 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-200 shadow-md"
          >
            <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-400" />
            <div className="flex-1">
              <p className="text-xs font-medium leading-relaxed">{error}</p>
              <button
                type="button"
                onClick={startListening}
                className="mt-1 text-xs text-rose-300 underline font-bold hover:text-white cursor-pointer"
              >
                Try Again
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live Transcript / Confirmed Speech Area */}
      <AnimatePresence>
        {combinedText && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" /> Live Spoken Response
              </span>
              {transcript && (
                <span className={`text-[10px] font-mono font-bold ${transcript.length > 1800 ? 'text-rose-400' : 'text-slate-400'}`}>
                  {transcript.length} chars
                </span>
              )}
            </div>

            <div
              className={`relative rounded-2xl border p-5 min-h-[110px] text-sm leading-relaxed transition-all shadow-inner ${
                isListening
                  ? 'bg-slate-950/80 border-rose-900/60 shadow-rose-950/20'
                  : isFinishing
                  ? 'bg-slate-950/80 border-amber-800/60 shadow-amber-950/20'
                  : 'bg-slate-950/80 border-slate-800'
              }`}
            >
              {/* Confirmed words */}
              <span className="text-slate-100 font-medium whitespace-pre-wrap">
                {transcript}
              </span>

              {/* Interim in-progress words */}
              {interimTranscript && (
                <span className="text-indigo-300/80 italic ml-1">
                  {interimTranscript}
                </span>
              )}

              {/* Live recording cursor */}
              {isListening && (
                <motion.span
                  className="inline-block w-0.5 h-4 bg-indigo-400 ml-1 align-middle"
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 0.9, repeat: Infinity }}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action buttons (Manual overrides) */}
      <div className="flex items-center justify-between gap-3 pt-1">
        {/* Re-record */}
        <button
          id="voice-rerecord-btn"
          type="button"
          onClick={handleReRecord}
          disabled={isBusy || (!combinedText && !isListening)}
          aria-label="Re-record answer"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-sm"
        >
          <RotateCcw size={13} />
          Re-record
        </button>

        {/* Finish Answer Now */}
        <Button
          id="voice-submit-btn"
          type="button"
          onClick={handleManualSubmit}
          disabled={!hasAnswer || isBusy}
          isLoading={isBusy}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold rounded-xl flex items-center gap-2 shadow-lg transition-all text-xs cursor-pointer"
        >
          {!isBusy && <Send size={14} />}
          <span>Finish Answer Now</span>
        </Button>
      </div>
    </div>
  );
};
