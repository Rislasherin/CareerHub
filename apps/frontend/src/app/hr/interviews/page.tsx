'use client';

import React from 'react';
import { Calendar, Users, ArrowRight } from 'lucide-react';
import { GlassCard } from '@/components/shared/GlassCard';
import { Button } from '@/components/shared/Button';
import Link from 'next/link';

export default function InterviewsPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Interviews</h1>
        <p className="text-slate-500 font-medium mt-1">Schedule and manage candidate interviews.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <GlassCard className="p-8 flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Users size={32} />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900">Manage Panel</h3>
            <p className="text-slate-500 text-sm font-medium mt-2">
              Add and manage your team of interviewers before scheduling.
            </p>
          </div>
          <Link href="/hr/interviewers">
            <Button className="bg-indigo-600 hover:bg-indigo-700 font-bold px-8 group">
              Go to Interviewers <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </GlassCard>

        <GlassCard className="p-8 flex flex-col items-center text-center space-y-4 opacity-60">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
            <Calendar size={32} />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900">Schedule Interview</h3>
            <p className="text-slate-500 text-sm font-medium mt-2">
              Interview scheduling will be available soon.
            </p>
          </div>

        </GlassCard>
      </div>
    </div>
  );
}
