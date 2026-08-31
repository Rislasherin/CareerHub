'use client';

import React from 'react';
import { useLocalParticipant, useTrackToggle, VideoTrack } from '@livekit/components-react';
import { Track } from 'livekit-client';
import { User } from 'lucide-react';

export const PracticeCameraPreview: React.FC = () => {
  const { localParticipant } = useLocalParticipant();
  const { enabled: cameraEnabled } = useTrackToggle({
    source: Track.Source.Camera,
  });

  const cameraPublication = localParticipant?.getTrackPublication(Track.Source.Camera);
  const isVideoActive = cameraEnabled && cameraPublication?.track && !cameraPublication.isMuted;

  return (
    <div className="w-full h-full relative bg-slate-950 flex flex-col items-center justify-center">
      {isVideoActive && cameraPublication?.track ? (
        <VideoTrack
          trackRef={{
            participant: localParticipant,
            source: Track.Source.Camera,
            publication: cameraPublication,
          }}
          className="w-full h-full object-cover scale-x-[-1]"
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
