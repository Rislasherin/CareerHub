'use client';

import React, { useRef, useEffect } from 'react';
import { User } from 'lucide-react';

interface ICandidateVideoRendererProps {
  stream?: MediaStream | null;
}

export const CandidateVideoRenderer: React.FC<ICandidateVideoRendererProps> = ({ stream }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="w-full h-full relative bg-slate-950 flex flex-col items-center justify-center">
      {stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover -scale-x-100"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center text-slate-600">
          <User size={44} className="mb-2" />
          <span className="text-xs font-bold">Camera Off</span>
        </div>
      )}
    </div>
  );
};
