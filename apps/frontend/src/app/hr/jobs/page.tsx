'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { GlassCard } from '@/components/shared/GlassCard';

export default function HRJobsPage() {
  return (
    <DashboardLayout>
      <div className="max-w-4xl">
        <h1 className="text-4xl font-black text-slate-900 mb-2">Job Postings</h1>
        <p className="text-slate-500 mb-10">Create and manage your open positions.</p>
        
        <GlassCard className="p-10 border-slate-100 rounded-[2.5rem]">
          <p className="text-slate-400 font-medium">Job management coming soon...</p>
        </GlassCard>
      </div>
    </DashboardLayout>
  );
}
