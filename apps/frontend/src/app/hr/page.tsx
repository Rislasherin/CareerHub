'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { GlassCard } from '@/components/shared/GlassCard';
import { Button } from '@/components/shared/Button';
import { Users, Briefcase, UserCheck, Activity, ChevronRight, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

const stats = [
  { label: 'Active Jobs', value: '8', icon: Briefcase, color: '#8b5cf6' },
  { label: 'Total Interviewers', value: '12', icon: Users, color: '#6366f1' },
  { label: 'Candidates Placed', value: '45', icon: UserCheck, color: '#10b981' },
  { label: 'Interviews Today', value: '4', icon: Activity, color: '#f59e0b' },
];

export default function HRDashboard() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        {/* --- Welcome Banner --- */}
        <section className="flex flex-col md:flex-row items-center justify-between gap-6 p-10 rounded-[2rem] bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xl shadow-purple-600/20">
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-black mb-2 tracking-tight">Company Dashboard</h1>
            <p className="text-purple-100 font-medium opacity-90">Manage your recruitment pipeline and interviewers.</p>
          </div>
          <Button className="bg-white text-purple-600 hover:bg-purple-50 border-none shadow-lg">
            <Plus size={18} className="mr-2" /> Post New Job
          </Button>
        </section>

        {/* --- Stats Grid --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
          {/* --- Recent Candidates --- */}
          <section className="lg:col-span-2 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-text-main">Recent Candidates</h2>
              <Button variant="ghost" className="text-purple-600 hover:bg-purple-50 font-bold">View Pipeline <ChevronRight size={16} /></Button>
            </div>

            <div className="flex flex-col gap-4">
              {[
                { name: 'Alice Smith', job: 'Frontend Developer', status: 'In Review' },
                { name: 'Bob Johnson', job: 'Product Designer', status: 'Interviewing' }
              ].map((candidate, idx) => (
                <GlassCard key={idx} className="flex items-center justify-between p-6 group hover:border-purple-600/30 transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
                      {candidate.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="font-black text-text-main group-hover:text-purple-600 transition-colors">{candidate.name}</h3>
                      <p className="text-sm font-medium text-text-muted">{candidate.job}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-slate-100 text-slate-600">
                      {candidate.status}
                    </span>
                    <Button variant="outline" className="px-5 py-2 rounded-xl font-bold border-slate-200 hover:border-purple-600 hover:text-purple-600 transition-all">Review</Button>
                  </div>
                </GlassCard>
              ))}
            </div>
          </section>

          {/* --- Quick Actions --- */}
          <section className="flex flex-col gap-6">
            <h2 className="text-xl font-black text-text-main">Quick Actions</h2>
            <GlassCard className="p-8 flex flex-col gap-4">
              <Button fullWidth className="bg-purple-600 hover:bg-purple-700 py-4 rounded-2xl font-bold border-none shadow-lg shadow-purple-600/20">
                Add Interviewer
              </Button>
              <Button fullWidth variant="outline" className="py-4 rounded-2xl font-bold border-slate-200 hover:border-purple-600 hover:text-purple-600">
                Update Company Profile
              </Button>
              <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-xs font-medium text-slate-500 leading-relaxed">
                  Need help with your hiring process? Check our <Link href="#" className="text-purple-600 font-bold">Recruiter Guide</Link>.
                </p>
              </div>
            </GlassCard>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}
