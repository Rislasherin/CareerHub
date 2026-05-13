'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { GlassCard } from '@/components/shared/GlassCard';

export default function HRPipelinePage() {
  return (
    <DashboardLayout>
      <div className="max-w-4xl">
        <h1 className="text-4xl font-black text-slate-900 mb-2">Recruitment Pipeline</h1>
        <p className="text-slate-500 mb-10">Track candidates through your hiring stages.</p>
        
        <GlassCard className="p-10 border-slate-100 rounded-[2.5rem]">
          <p className="text-slate-400 font-medium">Pipeline tracking coming soon...</p>
        </GlassCard>
      </div>
    </DashboardLayout>
  );
}
