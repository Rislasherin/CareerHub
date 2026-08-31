'use client';

import React from 'react';
import { useConnectionState } from '@livekit/components-react';
import { ConnectionState } from 'livekit-client';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

export const PracticeConnectionStatus: React.FC = () => {
  const connectionState = useConnectionState();

  const getStatusBadge = () => {
    switch (connectionState) {
      case ConnectionState.Connected:
        return {
          label: 'Connected',
          icon: <Wifi size={12} className="text-emerald-400" />,
          bg: 'bg-emerald-950/60 border-emerald-800 text-emerald-300',
          dot: 'bg-emerald-400',
        };
      case ConnectionState.Connecting:
        return {
          label: 'Connecting…',
          icon: <RefreshCw size={12} className="text-amber-400 animate-spin" />,
          bg: 'bg-amber-950/60 border-amber-800 text-amber-300',
          dot: 'bg-amber-400 animate-ping',
        };
      case ConnectionState.Reconnecting:
        return {
          label: 'Reconnecting…',
          icon: <RefreshCw size={12} className="text-amber-400 animate-spin" />,
          bg: 'bg-amber-950/60 border-amber-800 text-amber-300',
          dot: 'bg-amber-400',
        };
      case ConnectionState.Disconnected:
      default:
        return {
          label: 'Disconnected',
          icon: <WifiOff size={12} className="text-rose-400" />,
          bg: 'bg-rose-950/60 border-rose-800 text-rose-300',
          dot: 'bg-rose-400',
        };
    }
  };

  const status = getStatusBadge();

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold backdrop-blur-md ${status.bg}`}>
      <span className={`w-2 h-2 rounded-full ${status.dot}`} />
      {status.icon}
      <span>{status.label}</span>
    </div>
  );
};
