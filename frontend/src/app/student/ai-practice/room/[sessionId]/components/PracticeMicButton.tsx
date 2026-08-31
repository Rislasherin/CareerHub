'use client';

import React from 'react';
import { useTrackToggle } from '@livekit/components-react';
import { Track } from 'livekit-client';
import { Mic, MicOff } from 'lucide-react';

interface PracticeMicButtonProps {
  disabled?: boolean;
}

export const PracticeMicButton: React.FC<PracticeMicButtonProps> = ({ disabled = false }) => {
  const { toggle, enabled } = useTrackToggle({ source: Track.Source.Microphone });
  const isMuted = !enabled;

  return (
    <button
      type="button"
      onClick={() => toggle()}
      disabled={disabled}
      aria-label={isMuted ? 'Unmute microphone' : 'Mute microphone'}
      className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
        !isMuted
          ? 'bg-rose-600 hover:bg-rose-500 text-white ring-2 ring-rose-500/40'
          : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
      }`}
    >
      {!isMuted ? <Mic size={15} /> : <MicOff size={15} />}
      <span>{!isMuted ? 'Mic Active' : 'Mic Muted'}</span>
    </button>
  );
};
