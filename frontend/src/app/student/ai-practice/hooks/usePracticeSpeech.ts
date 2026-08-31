'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

// ── Browser type augmentation ─────────────────────────────────────────────────
interface ISpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly [index: number]: { readonly transcript: string; readonly confidence: number };
}

interface ISpeechRecognitionEvent extends Event {
  readonly results: {
    readonly length: number;
    item(index: number): ISpeechRecognitionResult;
    readonly [index: number]: ISpeechRecognitionResult;
  };
  readonly resultIndex: number;
}

interface ISpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

interface ISpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: ISpeechRecognitionEvent) => void) | null;
  onerror: ((event: ISpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => ISpeechRecognition;
    webkitSpeechRecognition?: new () => ISpeechRecognition;
  }
}

// ── Types ─────────────────────────────────────────────────────────────────────

export type ConversationalSpeechState =
  | 'idle'
  | 'ai_speaking'
  | 'listening'
  | 'finishing'
  | 'submitting'
  | 'error';

export interface UsePracticeSpeechOptions {
  /** Callback fired automatically when silence threshold is reached after speaking */
  onAutoSubmit?: (transcript: string) => Promise<void> | void;
  /** Silence threshold in ms before finalizing the turn (default: 2600ms) */
  silenceDelayMs?: number;
  /** Minimum confirmed character length required for valid auto-finalization */
  minChars?: number;
  /** Minimum confirmed word count required for valid auto-finalization */
  minWords?: number;
  /** Whether the AI is currently speaking (locks mic & echo capture) */
  isAISpeaking?: boolean;
  /** Unique ID of the active question (resets state on question change) */
  questionId?: string;
}

export interface UsePracticeSpeechReturn {
  transcript: string;
  interimTranscript: string;
  combinedText: string;
  state: ConversationalSpeechState;
  isListening: boolean;
  isFinishing: boolean;
  isSupported: boolean;
  error: string | null;
  countdownSeconds: number | null;
  startListening: () => void;
  stopListening: () => void;
  forceSubmit: () => void;
  reset: () => void;
}

// ── Validation Helpers ────────────────────────────────────────────────────────

const DISMISSIBLE_FILLERS = new Set(['um', 'uh', 'ah', 'er', 'mm', 'hmm', 'yeah', 'yes', 'okay']);

function isMeaningfulAnswer(text: string, minChars: number, minWords: number): boolean {
  const trimmed = text.trim();
  if (trimmed.length < minChars) return false;

  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length < minWords) return false;

  // Check if answer contains non-filler words
  const nonFillers = words.filter((w) => !DISMISSIBLE_FILLERS.has(w.toLowerCase().replace(/[^a-z]/g, '')));
  return nonFillers.length >= Math.max(1, minWords - 1);
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function usePracticeSpeech({
  onAutoSubmit,
  silenceDelayMs = 2600,
  minChars = 10,
  minWords = 3,
  isAISpeaking = false,
  questionId,
}: UsePracticeSpeechOptions = {}): UsePracticeSpeechReturn {
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [state, setState] = useState<ConversationalSpeechState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [countdownSeconds, setCountdownSeconds] = useState<number | null>(null);

  const isMountedRef = useRef(true);
  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const intentionalStopRef = useRef(false);
  const confirmedTextRef = useRef('');
  const submissionLockedRef = useRef(false);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isAISpeakingRef = useRef(isAISpeaking);
  const onAutoSubmitRef = useRef(onAutoSubmit);
  const lastQuestionIdRef = useRef(questionId);

  useEffect(() => {
    isAISpeakingRef.current = isAISpeaking;
  }, [isAISpeaking]);

  useEffect(() => {
    onAutoSubmitRef.current = onAutoSubmit;
  }, [onAutoSubmit]);

  const isSupported =
    typeof window !== 'undefined' &&
    (Boolean(window.SpeechRecognition) || Boolean(window.webkitSpeechRecognition));

  // ── Clear Timers ──────────────────────────────────────────────────────────

  const clearSilenceTimers = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    if (isMountedRef.current) {
      setCountdownSeconds(null);
    }
  }, []);

  // ── Trigger Submission ────────────────────────────────────────────────────

  const executeSubmission = useCallback(async (textToSubmit: string) => {
    if (submissionLockedRef.current) return;
    if (!isMeaningfulAnswer(textToSubmit, minChars, minWords)) return;

    submissionLockedRef.current = true;
    clearSilenceTimers();

    if (isMountedRef.current) {
      setState('submitting');
    }

    // Stop recognition during submission
    intentionalStopRef.current = true;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }

    try {
      if (onAutoSubmitRef.current) {
        await onAutoSubmitRef.current(textToSubmit.trim());
      }
    } catch (err) {
      console.error('[usePracticeSpeech] Submission error:', err);
      if (isMountedRef.current) {
        submissionLockedRef.current = false;
        setState('idle');
      }
    }
  }, [minChars, minWords, clearSilenceTimers]);

  // ── Start Silence Countdown ───────────────────────────────────────────────

  const scheduleSilenceFinalization = useCallback(() => {
    clearSilenceTimers();

    const currentText = confirmedTextRef.current.trim();
    if (!isMeaningfulAnswer(currentText, minChars, minWords)) {
      return;
    }

    if (isMountedRef.current) {
      setState('finishing');
      let remainingMs = silenceDelayMs;
      setCountdownSeconds(Math.ceil(remainingMs / 1000));

      countdownIntervalRef.current = setInterval(() => {
        if (!isMountedRef.current) return;
        remainingMs -= 500;
        if (remainingMs <= 0) {
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
          }
          setCountdownSeconds(null);
        } else {
          setCountdownSeconds(Math.ceil(remainingMs / 1000));
        }
      }, 500);
    }

    silenceTimerRef.current = setTimeout(() => {
      clearSilenceTimers();
      const finalAccumulated = confirmedTextRef.current.trim();
      if (isMeaningfulAnswer(finalAccumulated, minChars, minWords)) {
        executeSubmission(finalAccumulated);
      } else {
        if (isMountedRef.current) {
          setState('listening');
        }
      }
    }, silenceDelayMs);
  }, [clearSilenceTimers, executeSubmission, minChars, minWords, silenceDelayMs]);

  // ── Factory ───────────────────────────────────────────────────────────────

  const createRecognition = useCallback((): ISpeechRecognition | null => {
    if (typeof window === 'undefined') return null;
    const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SR) return null;

    const rec = new SR();
    rec.lang = 'en-US';
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    return rec;
  }, []);

  // ── Attach Handlers ───────────────────────────────────────────────────────

  const attachHandlers = useCallback(
    (rec: ISpeechRecognition) => {
      rec.onstart = () => {
        if (!isMountedRef.current) return;
        if (isAISpeakingRef.current) {
          try {
            rec.abort();
          } catch {
            // ignore
          }
          return;
        }
        setState('listening');
        setError(null);
      };

      rec.onresult = (event: ISpeechRecognitionEvent) => {
        if (!isMountedRef.current) return;
        // Echo protection: discard any input if AI is currently speaking
        if (isAISpeakingRef.current || submissionLockedRef.current) {
          return;
        }

        let interim = '';
        let hasNewSpeech = false;

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const text = result[0]?.transcript ?? '';
          if (result.isFinal) {
            const cleaned = text.trim();
            if (cleaned) {
              const currentConfirmed = confirmedTextRef.current;
              const separator = currentConfirmed ? ' ' : '';
              confirmedTextRef.current = currentConfirmed + separator + cleaned;
              setTranscript(confirmedTextRef.current);
              hasNewSpeech = true;
            }
          } else {
            interim += text;
            if (text.trim()) hasNewSpeech = true;
          }
        }

        setInterimTranscript(interim);

        // If new speech was detected, reset silence timer & continue listening
        if (hasNewSpeech) {
          setState('listening');
          clearSilenceTimers();

          // Schedule silence finalization if meaningful answer accumulated
          if (isMeaningfulAnswer(confirmedTextRef.current, minChars, minWords)) {
            scheduleSilenceFinalization();
          }
        }
      };

      rec.onerror = (event: ISpeechRecognitionErrorEvent) => {
        if (!isMountedRef.current) return;
        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          setError('Microphone access denied. Please allow mic access in your browser settings.');
        } else if (event.error === 'no-speech') {
          // Non-fatal — keep listening unless silence timer already active
          return;
        } else if (event.error === 'network') {
          setError('Network error during speech recognition. Check your connection.');
        } else if (event.error === 'aborted') {
          return;
        } else {
          setError(`Speech recognition error: ${event.error}`);
        }
        setState('idle');
        intentionalStopRef.current = true;
      };

      rec.onend = () => {
        if (!isMountedRef.current) return;
        setInterimTranscript('');
        if (intentionalStopRef.current || submissionLockedRef.current || isAISpeakingRef.current) {
          return;
        }
        // Unexpected end -> auto-restart if still mounted & not busy
        if (recognitionRef.current) {
          try {
            recognitionRef.current.start();
          } catch {
            // ignore
          }
        }
      };
    },
    [clearSilenceTimers, minChars, minWords, scheduleSilenceFinalization]
  );

  // ── Public API ────────────────────────────────────────────────────────────

  const startListening = useCallback(() => {
    if (!isSupported) {
      if (isMountedRef.current) {
        setError('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      }
      return;
    }

    if (isAISpeakingRef.current) {
      return; // Do not start while AI speaks
    }

    if (recognitionRef.current) {
      try {
        intentionalStopRef.current = true;
        recognitionRef.current.abort();
      } catch {
        // ignore
      }
    }

    confirmedTextRef.current = '';
    submissionLockedRef.current = false;
    clearSilenceTimers();
    intentionalStopRef.current = false;

    if (isMountedRef.current) {
      setTranscript('');
      setInterimTranscript('');
      setError(null);
    }

    const rec = createRecognition();
    if (!rec) return;

    attachHandlers(rec);
    recognitionRef.current = rec;

    try {
      rec.start();
    } catch {
      if (isMountedRef.current) {
        setError('Failed to start microphone. Please try again.');
        setState('idle');
      }
    }
  }, [isSupported, createRecognition, attachHandlers, clearSilenceTimers]);

  const stopListening = useCallback(() => {
    intentionalStopRef.current = true;
    clearSilenceTimers();
    if (isMountedRef.current) {
      setInterimTranscript('');
      setState('idle');
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
  }, [clearSilenceTimers]);

  const forceSubmit = useCallback(() => {
    const textToSubmit = (confirmedTextRef.current + (interimTranscript ? ` ${interimTranscript}` : '')).trim();
    if (textToSubmit) {
      executeSubmission(textToSubmit);
    }
  }, [interimTranscript, executeSubmission]);

  const reset = useCallback(() => {
    intentionalStopRef.current = true;
    clearSilenceTimers();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }
    confirmedTextRef.current = '';
    submissionLockedRef.current = false;
    if (isMountedRef.current) {
      setTranscript('');
      setInterimTranscript('');
      setState('idle');
      setError(null);
    }
  }, [clearSilenceTimers]);

  // ── Reset on Question Change ──────────────────────────────────────────────

  useEffect(() => {
    if (questionId && questionId !== lastQuestionIdRef.current) {
      lastQuestionIdRef.current = questionId;
      reset();
    }
  }, [questionId, reset]);

  // ── Respond to isAISpeaking transitions ────────────────────────────────────

  useEffect(() => {
    if (isAISpeaking) {
      // Abort recognition immediately when AI starts speaking
      intentionalStopRef.current = true;
      clearSilenceTimers();
      if (isMountedRef.current) {
        setInterimTranscript('');
        setState('ai_speaking');
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    } else {
      // AI finished speaking -> automatically start listening for the student's answer
      const timer = setTimeout(() => {
        if (isMountedRef.current && !isAISpeakingRef.current) {
          startListening();
        }
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isAISpeaking, clearSilenceTimers, startListening]);

  // ── Cleanup on unmount ────────────────────────────────────────────────────

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      intentionalStopRef.current = true;
      clearSilenceTimers();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, [clearSilenceTimers]);

  const combinedText = transcript + (interimTranscript ? ` ${interimTranscript}` : '');

  return {
    transcript,
    interimTranscript,
    combinedText,
    state,
    isListening: state === 'listening' || state === 'finishing',
    isFinishing: state === 'finishing',
    isSupported,
    error,
    countdownSeconds,
    startListening,
    stopListening,
    forceSubmit,
    reset,
  };
}
