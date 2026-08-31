import { useEffect, useRef, useState } from 'react';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

export interface FaceAndGazeDetectionState {
  faceCount: number;
  isGazeDeviated: boolean;
  isModelLoaded: boolean;
}

export function useFaceAndGazeDetection(
  stream: MediaStream | null,
  isActive: boolean
) {
  const [state, setState] = useState<FaceAndGazeDetectionState>({
    faceCount: 1, // Assume 1 face by default until model loads
    isGazeDeviated: false,
    isModelLoaded: false,
  });

  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const requestRef = useRef<number | null>(null);
  const lastVideoTimeRef = useRef<number>(-1);
  const lastInferenceTimeRef = useRef<number>(0);

  // Initialize MediaPipe Model
  useEffect(() => {
    let isMounted = true;

    const loadModel = async () => {
      try {
        const filesetResolver = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        
        const faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
            delegate: "CPU"
          },
          outputFaceBlendshapes: true,
          runningMode: "VIDEO",
          numFaces: 5,
        });

        if (isMounted) {
          faceLandmarkerRef.current = faceLandmarker;
          setState(s => ({ ...s, isModelLoaded: true }));
        }
      } catch (err) {
        console.warn("[IntegrityMonitor] Failed to load FaceLandmarker. Falling back to basic integrity.", err);
      }
    };

    if (isActive) {
      loadModel();
    }

    return () => {
      isMounted = false;
      if (faceLandmarkerRef.current) {
        faceLandmarkerRef.current.close();
        faceLandmarkerRef.current = null;
      }
    };
  }, [isActive]);

  // Bind Stream to detached Video Element and run inference
  useEffect(() => {
    if (!isActive || !stream || !state.isModelLoaded || !faceLandmarkerRef.current) {
      return;
    }

    const video = document.createElement('video');
    video.autoplay = true;
    video.playsInline = true;
    video.muted = true;
    video.srcObject = stream;
    video.play().catch(e => console.warn('Video play error:', e));
    videoRef.current = video;

    const detectFrame = () => {
      if (!videoRef.current || !faceLandmarkerRef.current) return;
      
      if (
        videoRef.current.readyState < 2 || 
        videoRef.current.videoWidth === 0 || 
        videoRef.current.videoHeight === 0 ||
        typeof faceLandmarkerRef.current.detectForVideo !== 'function'
      ) {
        requestRef.current = requestAnimationFrame(detectFrame);
        return;
      }

      const now = performance.now();
      
      // Throttle to roughly ~500ms intervals (2 FPS)
      if (videoRef.current.currentTime !== lastVideoTimeRef.current && (now - lastInferenceTimeRef.current) > 500) {
        try {
          const results = faceLandmarkerRef.current.detectForVideo(videoRef.current, Math.floor(now));
          lastVideoTimeRef.current = videoRef.current.currentTime;
          lastInferenceTimeRef.current = now;

          const numFaces = results.faceBlendshapes ? results.faceBlendshapes.length : 0;
          
          let deviated = false;
          // Gaze detection
          if (numFaces === 1 && results.faceBlendshapes && results.faceBlendshapes[0]) {
            const blendshapes = results.faceBlendshapes[0].categories;
            
            // MediaPipe blendshape scores: 0 to 1
            const eyeLookOutLeft = blendshapes.find(b => b.categoryName === 'eyeLookOutLeft')?.score || 0;
            const eyeLookInLeft = blendshapes.find(b => b.categoryName === 'eyeLookInLeft')?.score || 0;
            const eyeLookOutRight = blendshapes.find(b => b.categoryName === 'eyeLookOutRight')?.score || 0;
            const eyeLookInRight = blendshapes.find(b => b.categoryName === 'eyeLookInRight')?.score || 0;
            const eyeLookUpLeft = blendshapes.find(b => b.categoryName === 'eyeLookUpLeft')?.score || 0;
            const eyeLookUpRight = blendshapes.find(b => b.categoryName === 'eyeLookUpRight')?.score || 0;
            const eyeLookDownLeft = blendshapes.find(b => b.categoryName === 'eyeLookDownLeft')?.score || 0;
            const eyeLookDownRight = blendshapes.find(b => b.categoryName === 'eyeLookDownRight')?.score || 0;
            
            // Very conservative threshold
            const LOOK_THRESHOLD = 0.65;
            
            const isLookingLeft = eyeLookOutLeft > LOOK_THRESHOLD && eyeLookInRight > LOOK_THRESHOLD;
            const isLookingRight = eyeLookInLeft > LOOK_THRESHOLD && eyeLookOutRight > LOOK_THRESHOLD;
            const isLookingUp = eyeLookUpLeft > LOOK_THRESHOLD && eyeLookUpRight > LOOK_THRESHOLD;
            const isLookingDown = eyeLookDownLeft > LOOK_THRESHOLD && eyeLookDownRight > LOOK_THRESHOLD;

            if (isLookingLeft || isLookingRight || isLookingUp || isLookingDown) {
              deviated = true;
            }
          }

          setState(prev => {
            if (prev.faceCount !== numFaces || prev.isGazeDeviated !== deviated) {
              return { ...prev, faceCount: numFaces, isGazeDeviated: deviated };
            }
            return prev;
          });
          
        } catch (err) {
          // Ignore transient detection errors
        }
      }
      
      requestRef.current = requestAnimationFrame(detectFrame);
    };

    video.addEventListener('loadeddata', () => {
      requestRef.current = requestAnimationFrame(detectFrame);
    });

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [isActive, stream, state.isModelLoaded]);

  return state;
}
