'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { GlassCard } from '@/components/shared/GlassCard';

export default function HRProfilePage() {
  return (
    <DashboardLayout>
      <div className="max-w-4xl">
        <h1 className="text-4xl font-black text-slate-900 mb-2">Company Profile</h1>
        <p className="text-slate-500 mb-10">Manage your organization details and brand identity.</p>

        <GlassCard className="p-10 border-slate-100 rounded-[2.5rem]">
          <p className="text-slate-400 font-medium">Profile settings coming soon...</p>
        </GlassCard>
      </div>
    </DashboardLayout>
  );
}
