'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Play } from 'lucide-react';

interface AIQuestionSpeakerProps {
  /** The current question text to be spoken. When this changes, speech restarts. */
  questionText: string;
  /** Called when speech finishes or is skipped — signals parent to open the mic */
  onSpeechEnd?: () => void;
  /** Called when speaking status changes (true while AI speaks, false when done) */
  onSpeakingChange?: (isSpeaking: boolean) => void;
}

// ── Root causes fixed in this rewrite ─────────────────────────────────────────
//
// 1. cancel() + speak() in same tick:
//    Chrome's engine processes both async. Calling cancel() then speak()
//    immediately causes Chrome to also cancel the new utterance.
//    Fix: await an 80ms setTimeout between cancel and speak.
//
// 2. getVoices() returns [] on first call in Chrome:
//    Chrome loads voices from a subprocess asynchronously. Fix: use
//    onvoiceschanged to wait for them, with a 2s fallback.
//
// 3. Autoplay restrictions:
//    Browsers block speechSynthesis.speak() before any user gesture.
//    Fix: detect the blocked case and surface a "Play Question" button.
//
// 4. isMuted closure stale value:
//    Fix: keep isMuted in a ref so doSpeak always reads the current value.

const isSynthSupported =
  typeof window !== 'undefined' && 'speechSynthesis' in window;

/** Resolves with available voices, handling Chrome's async load. */
function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (!isSynthSupported) { resolve([]); return; }
    const v = window.speechSynthesis.getVoices();
    if (v.length > 0) { resolve(v); return; }
    const handler = () => resolve(window.speechSynthesis.getVoices());
    window.speechSynthesis.onvoiceschanged = handler;
    setTimeout(() => resolve(window.speechSynthesis.getVoices()), 2000);
  });
}

/** Pick the best English voice available. */
function pickVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  if (!voices.length) return null;
  const en = voices.filter((v) => v.lang.startsWith('en'));
  const premium = en.find((v) =>
    v.name.toLowerCase().includes('google') ||
    v.name.toLowerCase().includes('natural') ||
    v.name.toLowerCase().includes('microsoft')
  );
  if (premium) return premium;
  return en.find((v) => v.lang === 'en-US') ?? en[0] ?? null;
}

/**
 * AIQuestionSpeaker
 *
 * Reads each new AI practice question aloud via window.speechSynthesis.
 * Completely isolated from HR infrastructure (no LiveKit, Cartesia, Deepgram).
 */
export const AIQuestionSpeaker: React.FC<AIQuestionSpeakerProps> = ({
  questionText,
  onSpeechEnd,
  onSpeakingChange,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [needsManualPlay, setNeedsManualPlay] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [speakError, setSpeakError] = useState<string | null>(null);

  const isMutedRef = useRef(false);
  const lastSpokenRef = useRef('');
  const pendingTextRef = useRef('');

  useEffect(() => { isMutedRef.current = isMuted; }, [isMuted]);

  const updateSpeaking = useCallback((speaking: boolean) => {
    setIsSpeaking(speaking);
    onSpeakingChange?.(speaking);
  }, [onSpeakingChange]);

  // ── Core speak ─────────────────────────────────────────────────────────────

  const doSpeak = useCallback(async (text: string) => {
    if (!isSynthSupported || !text) {
      setIsDone(true);
      updateSpeaking(false);
      onSpeechEnd?.();
      return;
    }
    if (isMutedRef.current) {
      setIsDone(true);
      updateSpeaking(false);
      onSpeechEnd?.();
      return;
    }

    setSpeakError(null);
    setNeedsManualPlay(false);

    // Step 1: Cancel previous utterance
    window.speechSynthesis.cancel();

    // Step 2: Yield thread so cancel() completes before we enqueue the new utterance.
    // Without this 80ms gap, Chrome often cancels the new utterance immediately.
    await new Promise<void>((r) => setTimeout(r, 80));

    if (isMutedRef.current) {
      setIsDone(true);
      updateSpeaking(false);
      onSpeechEnd?.();
      return;
    }

    // Step 3: Load voices (async for Chrome)
    const voices = await loadVoices();
    const voice = pickVoice(voices);

    // Step 4: Build utterance
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.92;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    if (voice) utterance.voice = voice;

    // Step 5: Autoplay-block guard.
    // If onstart hasn't fired after 1.5 s and the engine isn't running,
    // the browser blocked autoplay — surface a manual "Play Question" button.
    let autoplayTimer: ReturnType<typeof setTimeout> | null = setTimeout(() => {
      if (!window.speechSynthesis.speaking && !window.speechSynthesis.pending) {
        console.warn('[AIQuestionSpeaker] Autoplay likely blocked — showing Play button.');
        pendingTextRef.current = text;
        setNeedsManualPlay(true);
        updateSpeaking(false);
      }
    }, 1500);

    utterance.onstart = () => {
      if (autoplayTimer) { clearTimeout(autoplayTimer); autoplayTimer = null; }
      updateSpeaking(true);
      setIsDone(false);
      setNeedsManualPlay(false);
    };

    utterance.onend = () => {
      updateSpeaking(false);
      setIsDone(true);
      onSpeechEnd?.();
    };

    utterance.onerror = (evt) => {
      const errType = (evt as SpeechSynthesisErrorEvent).error;
      if (errType === 'interrupted' || errType === 'canceled') {
        updateSpeaking(false);
        return;
      }
      console.warn('[AIQuestionSpeaker] speechSynthesis error:', errType);
      setSpeakError(`Voice error (${errType})`);
      updateSpeaking(false);
      setIsDone(true);
      onSpeechEnd?.();
    };

    // Step 6: Speak
    window.speechSynthesis.speak(utterance);
  }, [onSpeechEnd, updateSpeaking]);


  // ── Effect: speak when question changes ────────────────────────────────────

  useEffect(() => {
    if (!questionText || questionText === lastSpokenRef.current) return;
    lastSpokenRef.current = questionText;
    setIsDone(false);
    updateSpeaking(true); // Immediately lock microphone before speech synthesis starts
    setNeedsManualPlay(false);

    const timer = setTimeout(() => doSpeak(questionText), 250);
    return () => clearTimeout(timer);
  }, [questionText, doSpeak, updateSpeaking]);


  // ── Cleanup on unmount ─────────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      if (isSynthSupported) {
        window.speechSynthesis.cancel();
      }
      // Ensure parent isAISpeaking is always cleared on unmount
      onSpeakingChange?.(false);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleManualPlay = () => {
    const text = pendingTextRef.current || questionText;
    if (text) { setNeedsManualPlay(false); doSpeak(text); }
  };

  const handleReplay = () => { if (questionText) doSpeak(questionText); };

  const handleSkip = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsDone(true);
    onSpeechEnd?.();
  };

  const handleMuteToggle = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsDone(true);
      onSpeechEnd?.();
    }
    setIsMuted((prev) => !prev);
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <AnimatePresence mode="wait">

        {/* Manual play — autoplay blocked */}
        {needsManualPlay && !isMuted && (
          <motion.button
            key="manual-play"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            onClick={handleManualPlay}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all shadow-md cursor-pointer"
          >
            <Play size={13} />
            Play Question
          </motion.button>
        )}

        {/* AI speaking */}
        {isSpeaking && (
          <motion.div
            key="speaking"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            className="flex items-center gap-2 text-indigo-600"
          >
            <div className="flex items-end gap-[3px] h-5">
              {[0, 1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  className="w-[3px] bg-indigo-500 rounded-full"
                  animate={{ height: ['6px', '18px', '6px'] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.12, ease: 'easeInOut' }}
                />
              ))}
            </div>
            <span className="text-xs font-bold tracking-wide">AI is speaking…</span>
            <button
              onClick={handleSkip}
              className="text-xs text-indigo-400 hover:text-indigo-600 font-semibold underline underline-offset-2 transition-colors cursor-pointer ml-1"
            >
              Skip
            </button>
          </motion.div>
        )}

        {/* Done — your turn */}
        {isDone && !isSpeaking && !needsManualPlay && (
          <motion.div
            key="done"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 text-emerald-600"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold tracking-wide">Your turn — click the mic to answer</span>
            {!isMuted && (
              <button
                onClick={handleReplay}
                title="Replay question"
                className="ml-2 text-xs text-slate-400 hover:text-indigo-500 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Play size={11} /> Replay
              </button>
            )}
          </motion.div>
        )}

        {/* Idle / preparing */}
        {!isSpeaking && !isDone && !needsManualPlay && !speakError && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 text-slate-400"
          >
            <span className="text-xs font-semibold">Preparing AI voice…</span>
          </motion.div>
        )}

        {/* Error */}
        {speakError && !isSpeaking && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-xs text-amber-600 font-semibold"
          >
            {speakError} —{' '}
            <button onClick={handleReplay} className="underline cursor-pointer">retry</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mute toggle */}
      <button
        onClick={handleMuteToggle}
        title={isMuted ? 'Unmute AI voice' : 'Mute AI voice'}
        className={`p-2 rounded-xl border transition-all cursor-pointer flex-shrink-0 ${
          isMuted
            ? 'bg-slate-100 border-slate-200 text-slate-400 hover:bg-slate-200'
            : 'bg-indigo-50 border-indigo-100 text-indigo-500 hover:bg-indigo-100'
        }`}
      >
        {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
      </button>
    </div>
  );
};
