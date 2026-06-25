'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/shared/Button';
import { 
  Video, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  FileText, 
  User, 
  CheckCircle2,
  CalendarDays,
  Users
} from 'lucide-react';
import { motion } from 'framer-motion';

import { useAppSelector } from '@/redux/hooks';

export default function InterviewerDashboard() {
  const interviewer = useAppSelector(state => state.interviewer.details);

  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto flex flex-col gap-8 pb-12">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Welcome back, {interviewer?.firstName || 'Interviewer'}! 👋</h1>
            <p className="text-slate-500 font-medium">Manage your interview schedule and provide candidate feedback.</p>
          </div>
        </header>

        {/* Hero Section */}
        <section className="bg-slate-900 rounded-[3rem] p-10 lg:p-14 text-white relative overflow-hidden shadow-2xl shadow-slate-900/20">
          <div className="absolute inset-0 z-0 opacity-10">
            <div className="absolute right-0 top-0 w-[500px] h-[500px] bg-indigo-500 rounded-full blur-[100px] translate-x-1/3 -translate-y-1/3" />
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
            <div className="text-center lg:text-left">
              <h2 className="text-4xl font-black mb-4 tracking-tight">Ready to evaluate?</h2>
              <p className="text-slate-400 font-medium text-lg max-w-lg mb-8">
                Your interview schedule is currently empty. You will receive notifications when HR assigns new candidates for evaluation.
              </p>
            </div>
            <div className="hidden lg:block">
              <CalendarDays size={180} className="text-white/5" />
            </div>
          </div>
        </section>

        {/* Empty States / Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {[
             { label: 'Assigned Interviews', value: '0', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
             { label: 'Pending Feedback', value: '0', icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
             { label: 'Completed Reviews', value: '0', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
           ].map((stat, i) => (
             <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6">
                <div className={`w-14 h-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                   <stat.icon size={28} />
                </div>
                <div>
                   <div className="text-3xl font-black text-slate-900">{stat.value}</div>
                   <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</div>
                </div>
             </div>
           ))}
        </div>

        {/* Coming Soon Block */}
        <section className="p-12 rounded-[3rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center py-24 bg-slate-50/50">
           <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center text-slate-300 mb-6">
              <Clock size={40} />
           </div>
           <h3 className="text-2xl font-black text-slate-900 mb-2">Interviews haven't started yet</h3>
           <p className="text-slate-500 font-medium max-w-md">
              The placement season is in the registration phase. Once students are verified and companies post jobs, your interview schedule will appear here.
           </p>
        </section>

      </div>
    </DashboardLayout>
  );
}
