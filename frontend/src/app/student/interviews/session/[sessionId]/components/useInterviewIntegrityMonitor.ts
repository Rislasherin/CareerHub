import { useEffect, useRef, useState } from 'react';
import { StudentInterviewService } from '@/services/student/interview.service';
import { useFaceAndGazeDetection } from './useFaceAndGazeDetection';

interface UseInterviewIntegrityMonitorProps {
  sessionId: string;
  isActive: boolean;
  cameraEnabled?: boolean;
  micEnabled?: boolean;
  studentStream: MediaStream | null;
}

export function useInterviewIntegrityMonitor({
  sessionId,
  isActive,
  cameraEnabled,
  micEnabled,
  studentStream,
}: UseInterviewIntegrityMonitorProps) {
  const isFirstMount = useRef(true);
  const lastCameraState = useRef(cameraEnabled);
  const lastMicState = useRef(micEnabled);
  const focusTimeout = useRef<NodeJS.Timeout | null>(null);

  const [isIntegrityBlocked, setIsIntegrityBlocked] = useState(false);
  const [blockingReason, setBlockingReason] = useState<string | null>(null);
  const [showGazeWarning, setShowGazeWarning] = useState(false);
  const [eventCount, setEventCount] = useState(0);

  const clearIntegrityBlock = () => {
    setIsIntegrityBlocked(false);
    setBlockingReason(null);
  };

  const reportEvent = async (eventType: string) => {
    if (!isActive) return;
    try {
      await StudentInterviewService.recordIntegrityEvent(sessionId, eventType);
    } catch (err) {
      // Intentionally swallow errors so the interview is not interrupted
      console.warn(`[IntegrityMonitor] Failed to report ${eventType}`, err);
    }
  };

  useEffect(() => {
    if (!isActive) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        reportEvent('PAGE_HIDDEN');
        reportEvent('TAB_SWITCH'); // Browsers often hide pages on tab switch
        setEventCount(c => c + 1);
        setIsIntegrityBlocked(true);
        setBlockingReason('TAB_SWITCH');
      } else if (document.visibilityState === 'visible') {
        reportEvent('PAGE_VISIBLE');
      }
    };

    const handleBlur = () => {
      // Debounce blur events to avoid rapid fire if user clicks around UI elements quickly
      if (focusTimeout.current) clearTimeout(focusTimeout.current);
      focusTimeout.current = setTimeout(() => {
        reportEvent('WINDOW_BLUR');
        setEventCount(c => c + 1);
        setIsIntegrityBlocked(true);
        setBlockingReason('WINDOW_BLUR');
      }, 500);
    };

    const handleFocus = () => {
      if (focusTimeout.current) {
        clearTimeout(focusTimeout.current);
      }
      reportEvent('WINDOW_FOCUS');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      if (focusTimeout.current) clearTimeout(focusTimeout.current);
    };
  }, [isActive, sessionId]);

  // Monitor LiveKit Track State Changes (Passively)
  useEffect(() => {
    if (!isActive || isFirstMount.current) {
      isFirstMount.current = false;
      lastCameraState.current = cameraEnabled;
      lastMicState.current = micEnabled;
      return;
    }

    if (cameraEnabled !== undefined && cameraEnabled !== lastCameraState.current) {
      if (!cameraEnabled) {
        reportEvent('CAMERA_DISABLED');
        setEventCount(c => c + 1);
        setIsIntegrityBlocked(true);
        setBlockingReason('CAMERA_DISABLED');
      } else {
        reportEvent('CAMERA_ENABLED');
        setBlockingReason(prev => {
          if (prev === 'CAMERA_DISABLED') setIsIntegrityBlocked(false);
          return prev === 'CAMERA_DISABLED' ? null : prev;
        });
      }
      lastCameraState.current = cameraEnabled;
    }

    if (micEnabled !== undefined && micEnabled !== lastMicState.current) {
      if (!micEnabled) {
        reportEvent('MIC_DISABLED');
        setEventCount(c => c + 1);
        setIsIntegrityBlocked(true);
        setBlockingReason('MIC_DISABLED');
      } else {
        reportEvent('MIC_ENABLED');
        setBlockingReason(prev => {
          if (prev === 'MIC_DISABLED') setIsIntegrityBlocked(false);
          return prev === 'MIC_DISABLED' ? null : prev;
        });
      }
      lastMicState.current = micEnabled;
    }
  }, [isActive, cameraEnabled, micEnabled, sessionId]);

  const { faceCount, isGazeDeviated, isModelLoaded } = useFaceAndGazeDetection(studentStream, isActive);

  const consecutiveNoFaceRef = useRef<number>(0);
  const consecutiveMultipleFaceRef = useRef<number>(0);
  const consecutiveGazeRef = useRef<number>(0);

  // Constants (~500ms intervals)
  const NO_FACE_THRESHOLD = 10; // 5s
  const MULTIPLE_FACES_THRESHOLD = 10; // 5s
  const GAZE_THRESHOLD = 20; // 10s

  useEffect(() => {
    if (!isActive || !isModelLoaded || cameraEnabled === false) {
      consecutiveNoFaceRef.current = 0;
      consecutiveMultipleFaceRef.current = 0;
      consecutiveGazeRef.current = 0;
      return;
    }

    // Handle Face Count
    if (faceCount === 0) {
      consecutiveNoFaceRef.current++;
      consecutiveMultipleFaceRef.current = 0;
      if (consecutiveNoFaceRef.current === NO_FACE_THRESHOLD) {
        reportEvent('FACE_NOT_DETECTED');
        setEventCount(c => c + 1);
        setIsIntegrityBlocked(true);
        setBlockingReason('FACE_NOT_DETECTED');
      }
    } else if (faceCount > 1) {
      consecutiveMultipleFaceRef.current++;
      consecutiveNoFaceRef.current = 0;
      if (consecutiveMultipleFaceRef.current === MULTIPLE_FACES_THRESHOLD) {
        reportEvent('MULTIPLE_FACES_DETECTED');
        setEventCount(c => c + 1);
        setIsIntegrityBlocked(true);
        setBlockingReason('MULTIPLE_FACES_DETECTED');
      }
    } else {
      consecutiveNoFaceRef.current = 0;
      consecutiveMultipleFaceRef.current = 0;
      setBlockingReason(prev => {
        if (prev === 'FACE_NOT_DETECTED' || prev === 'MULTIPLE_FACES_DETECTED') {
          setIsIntegrityBlocked(false);
          return null;
        }
        return prev;
      });
    }

    // Handle Gaze Deviation
    if (isGazeDeviated && faceCount === 1) {
      consecutiveGazeRef.current++;
      if (consecutiveGazeRef.current === GAZE_THRESHOLD) {
        reportEvent('GAZE_DEVIATION');
        setEventCount(c => c + 1);
        setShowGazeWarning(true);
      }
    } else {
      consecutiveGazeRef.current = 0;
      setShowGazeWarning(false);
    }
  }, [faceCount, isGazeDeviated, isModelLoaded, isActive, cameraEnabled]);

  return {
    isIntegrityBlocked,
    blockingReason,
    showGazeWarning,
    eventCount,
    clearIntegrityBlock
  };
}
