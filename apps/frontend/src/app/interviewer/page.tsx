'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { GlassCard } from '@/components/shared/GlassCard';
import { Button } from '@/components/shared/Button';
import { Calendar, Clock, CheckCircle2, User, ChevronRight, Video } from 'lucide-react';
import { motion } from 'framer-motion';

const stats = [
  { label: 'Upcoming Interviews', value: '2', icon: Calendar, color: '#0ea5e9' },
  { label: 'Completed', value: '15', icon: CheckCircle2, color: '#10b981' },
  { label: 'Pending Feedback', value: '1', icon: Clock, color: '#f59e0b' },
];

export default function InterviewerDashboard() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        {/* --- Welcome Banner --- */}
        <section className="flex flex-col md:flex-row items-center justify-between gap-6 p-10 rounded-[2rem] bg-gradient-to-r from-slate-700 to-slate-900 text-white shadow-xl shadow-slate-900/10">
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-black mb-2 tracking-tight">Interviewer Dashboard</h1>
            <p className="text-slate-300 font-medium opacity-90">Welcome back! You have 2 interviews scheduled for today.</p>
          </div>
          <Button className="bg-white text-slate-900 hover:bg-slate-100 border-none shadow-lg font-bold">
            View Calendar
          </Button>
        </section>

        {/* --- Stats Grid --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <GlassCard className="flex items-center gap-5 p-6 hover:translate-y-[-4px] transition-all duration-300">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                  <stat.icon size={28} />
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-black text-text-main">{stat.value}</span>
                  <span className="text-xs font-bold text-text-muted uppercase tracking-wider">{stat.label}</span>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* --- Today's Schedule --- */}
          <section className="lg:col-span-2 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-text-main">Today's Schedule</h2>
              <Button variant="ghost" className="text-slate-600 hover:bg-slate-50 font-bold">Full Schedule <ChevronRight size={16} /></Button>
            </div>

            <div className="flex flex-col gap-4">
              {[
                { name: 'David Chen', role: 'Frontend Developer', time: '2:00 PM - 3:00 PM', type: 'Technical Round' }
              ].map((interview, idx) => (
                <GlassCard key={idx} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 p-6 group hover:border-slate-400 transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
                      {interview.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="font-black text-text-main group-hover:text-slate-900 transition-colors">{interview.name}</h3>
                      <p className="text-sm font-medium text-text-muted">{interview.role} • {interview.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="flex items-center gap-2 text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl text-xs font-bold">
                      <Clock size={14} /> {interview.time}
                    </div>
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl font-bold border-none shadow-md">
                      <Video size={16} className="mr-2" /> Join Call
                    </Button>
                  </div>
                </GlassCard>
              ))}
            </div>
          </section>

          {/* --- Action Needed --- */}
          <section className="flex flex-col gap-6">
            <h2 className="text-xl font-black text-text-main">Action Needed</h2>
            <GlassCard className="p-8 flex flex-col gap-6">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Feedback Pending</span>
                <span className="text-sm font-black text-text-main">Emma Watson</span>
                <span className="text-xs font-medium text-text-muted">Product Designer • Completed 2h ago</span>
              </div>
              <Button fullWidth variant="outline" className="py-4 rounded-2xl font-bold border-slate-200 hover:border-slate-900 hover:text-slate-900">
                Submit Feedback
              </Button>
              <div className="mt-4 p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100">
                <p className="text-[11px] font-medium text-indigo-600 leading-relaxed">
                  Tip: Submitting feedback within 24 hours improves the hiring experience for candidates.
                </p>
              </div>
            </GlassCard>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}
