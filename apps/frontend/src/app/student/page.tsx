'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { GlassCard } from '@/components/shared/GlassCard';
import { Button } from '@/components/shared/Button';
import { Zap, Briefcase, Calendar, Star, TrendingUp, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const stats = [
  { label: 'Applied Jobs', value: '12', icon: Briefcase, color: '#0ea5e9' },
  { label: 'Interviews', value: '3', icon: Calendar, color: '#8b5cf6' },
  { label: 'Skill Score', value: '85%', icon: Star, color: '#f59e0b' },
  { label: 'Profile Views', value: '124', icon: TrendingUp, color: '#10b981' },
];

const jobs = [
  { id: 1, title: 'Frontend Developer', company: 'Google', salary: '₹18 - 24 LPA', type: 'Full-time', match: 98 },
  { id: 2, title: 'Product Designer', company: 'Figma', salary: '₹12 - 16 LPA', type: 'Remote', match: 92 },
  { id: 3, title: 'Software Engineer', company: 'Microsoft', salary: '₹22 - 30 LPA', type: 'Full-time', match: 85 },
];

export default function StudentDashboard() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        {/* --- Welcome Banner --- */}
        <section className="flex flex-col md:flex-row items-center justify-between gap-6 p-10 rounded-[2rem] bg-gradient-to-r from-student-primary to-indigo-600 text-white shadow-xl shadow-student-primary/20">
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-black mb-2 tracking-tight">Hello, John Doe! 👋</h1>
            <p className="text-indigo-100 font-medium opacity-90">You have 3 interviews scheduled for this week. Good luck!</p>
          </div>
          <Button className="bg-white text-student-primary hover:bg-indigo-50 border-none shadow-lg">Complete Profile</Button>
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
          {/* --- AI Matched Jobs --- */}
          <section className="lg:col-span-2 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
                  <Zap size={20} />
                </div>
                <h2 className="text-xl font-black text-text-main">AI Recommended Jobs</h2>
              </div>
              <Button variant="ghost" className="text-student-primary hover:bg-student-primary/5 font-bold">View All <ChevronRight size={16} /></Button>
            </div>

            <div className="flex flex-col gap-4">
              {jobs.map((job) => (
                <GlassCard key={job.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 p-6 group hover:border-student-primary/30 transition-all duration-300">
                  <div className="flex flex-col gap-1">
                    <h3 className="font-black text-lg text-text-main group-hover:text-student-primary transition-colors">{job.title}</h3>
                    <p className="text-sm font-medium text-text-muted">{job.company} • {job.type}</p>
                    <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md w-fit mt-1">{job.salary}</span>
                  </div>
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="flex items-center gap-1.5 text-amber-600 bg-amber-50 px-3 py-1.5 rounded-xl text-xs font-black">
                      <Zap size={14} /> {job.match}% Match
                    </div>
                    <Button variant="outline" className="px-6 py-2 rounded-xl font-bold border-slate-200 hover:border-student-primary hover:text-student-primary transition-all">Apply</Button>
                  </div>
                </GlassCard>
              ))}
            </div>
          </section>

          {/* --- Skill Analysis --- */}
          <section className="flex flex-col gap-6">
            <h2 className="text-xl font-black text-text-main">Skill Analysis</h2>
            <GlassCard className="p-8 flex flex-col gap-8">
              {[
                { name: 'React.js', value: '90%', color: 'bg-student-primary' },
                { name: 'TypeScript', value: '80%', color: 'bg-indigo-400' },
                { name: 'Next.js', value: '75%', color: 'bg-purple-500' }
              ].map((skill) => (
                <div key={skill.name} className="flex flex-col gap-3">
                  <div className="flex justify-between items-center text-sm font-bold">
                    <span className="text-text-main">{skill.name}</span>
                    <span className="text-text-muted">{skill.value}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: skill.value }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={`h-full rounded-full ${skill.color}`} 
                    />
                  </div>
                </div>
              ))}
              <Button variant="outline" fullWidth className="mt-4 py-4 rounded-2xl font-bold border-slate-200 hover:border-student-primary hover:text-student-primary">Take Skill Assessment</Button>
            </GlassCard>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}

