import React from 'react';
import { useTracks, VideoTrack } from '@livekit/components-react';
import { Track } from 'livekit-client';

export const InterviewAvatarRenderer: React.FC = () => {
  // Find the video track published by the 'tavus-avatar-agent' participant
  const tracks = useTracks([Track.Source.Camera]);

  const avatarTrack = tracks.find(
    (t) => t.participant.identity === 'tavus-avatar-agent' && t.publication.kind === Track.Kind.Video
  );

  if (!avatarTrack) {
    return null; // Don't render anything if the avatar isn't in the room or hasn't published video
  }

  return (
    <div className="absolute inset-0 z-10 w-full h-full rounded-3xl overflow-hidden bg-gray-900 flex items-center justify-center pointer-events-none">
      <VideoTrack 
        trackRef={avatarTrack} 
        className="w-full h-full object-cover" 
      />
    </div>
  );
};
