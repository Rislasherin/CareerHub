// frontend/src/hooks/useMediaDeviceCheck.ts

import { useState, useEffect, useCallback, useRef } from 'react';
import { IDeviceCheckStatus } from '@/types/ai-interview';

export function useMediaDeviceCheck() {
  const [status, setStatus] = useState<IDeviceCheckStatus>({
    hasCamera: false,
    hasMicrophone: false,
    cameraPermission: 'prompt',
    microphonePermission: 'prompt',
    stream: null,
    error: null,
  });

  const streamRef = useRef<MediaStream | null>(null);
  const transferredRef = useRef<boolean>(false);

  const requestMedia = useCallback(async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setStatus(prev => ({
          ...prev,
          error: 'Your browser does not support camera or microphone access.',
        }));
        return;
      }

      // Stop previous test stream if any
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: true,
      });

      streamRef.current = stream;

      setStatus({
        hasCamera: stream.getVideoTracks().length > 0,
        hasMicrophone: stream.getAudioTracks().length > 0,
        cameraPermission: 'granted',
        microphonePermission: 'granted',
        stream,
        error: null,
      });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.name : 'PermissionDenied';
      const isDenied = errorMsg === 'NotAllowedError' || errorMsg === 'PermissionDeniedError';
      
      setStatus(prev => ({
        ...prev,
        cameraPermission: isDenied ? 'denied' : 'prompt',
        microphonePermission: isDenied ? 'denied' : 'prompt',
        stream: null,
        error: isDenied 
          ? 'Camera or microphone access was denied. Please update your browser permissions.' 
          : 'Unable to access your media devices. Ensure no other application is using them.',
      }));
    }
  }, []);

  const transferStream = useCallback(() => {
    transferredRef.current = true;
    return streamRef.current;
  }, []);

  const stopTracks = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    requestMedia();
    return () => {
      // Only clean up tracks on unmount if they were not transferred to the interview room
      if (!transferredRef.current && streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [requestMedia]);

  return { status, retry: requestMedia, transferStream, stopTracks };
}

