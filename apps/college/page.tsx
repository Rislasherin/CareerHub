'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { GlassCard } from '@/components/shared/GlassCard';
import { Button } from '@/components/shared/Button';
import { GraduationCap, ShieldCheck, Building, TrendingUp, FileUp, ChevronRight, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const stats = [
  { label: 'Total Students', value: '1,245', icon: GraduationCap, color: '#10b981' },
  { label: 'Pending Verification', value: '3', icon: ShieldCheck, color: '#f59e0b' },
  { label: 'Partner Companies', value: '42', icon: Building, color: '#0ea5e9' },
  { label: 'Placement Rate', value: '88%', icon: TrendingUp, color: '#8b5cf6' },
];

export default function CollegeDashboard() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        {/* --- Welcome Banner --- */}
        <section className="flex flex-col md:flex-row items-center justify-between gap-6 p-10 rounded-[2rem] bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xl shadow-emerald-600/20">
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-black mb-2 tracking-tight">College Admin Portal</h1>
            <p className="text-emerald-50 font-medium opacity-90">Manage your students and track institutional placement performance.</p>
          </div>
          <Link href="/college/verification">
             <Button className="bg-white text-emerald-600 hover:bg-emerald-50 border-none shadow-lg">Review Pending</Button>
          </Link>
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
          {/* --- Recent Top Placements --- */}
          <section className="lg:col-span-2 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-text-main">Recent Top Placements</h2>
              <Button variant="ghost" className="text-emerald-600 hover:bg-emerald-50 font-bold">View All <ChevronRight size={16} /></Button>
            </div>

            <div className="flex flex-col gap-4">
              {[
                { name: 'Sarah Connor', company: 'Cyberdyne Systems', package: '₹24 LPA' },
                { name: 'Miles Dyson', company: 'Cyberdyne Systems', package: '₹30 LPA' }
              ].map((placement, idx) => (
                <GlassCard key={idx} className="flex items-center justify-between p-6 group hover:border-emerald-600/30 transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                      {placement.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="font-black text-text-main group-hover:text-emerald-600 transition-colors">{placement.name}</h3>
                      <p className="text-sm font-medium text-text-muted">Placed at: {placement.company}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-emerald-600">{placement.package}</span>
                  </div>
                </GlassCard>
              ))}
            </div>
          </section>

          {/* --- Quick Actions --- */}
          <section className="flex flex-col gap-6">
            <h2 className="text-xl font-black text-text-main">Quick Actions</h2>
            <GlassCard className="p-8 flex flex-col gap-4">
              <Button fullWidth className="bg-emerald-600 hover:bg-emerald-700 py-4 rounded-2xl font-bold border-none shadow-lg shadow-emerald-600/20">
                <FileUp size={18} className="mr-2" />
                Upload Students (CSV)
              </Button>
              <Link href="/college/verification" className="w-full">
                <Button fullWidth className="bg-amber-500 hover:bg-amber-600 py-4 rounded-2xl font-bold border-none shadow-lg shadow-amber-500/20 text-white">
                  <ShieldCheck size={18} className="mr-2" />
                  Verify Students (3)
                </Button>
              </Link>
              <Button fullWidth variant="outline" className="py-4 rounded-2xl font-bold border-slate-200 hover:border-emerald-600 hover:text-emerald-600">
                Export Placement Report
              </Button>
              <div className="mt-4 p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100">
                <div className="flex items-center gap-2 text-emerald-700 mb-1">
                  <Users size={14} />
                  <span className="text-xs font-bold uppercase tracking-wider">Admin Tip</span>
                </div>
                <p className="text-[11px] font-medium text-emerald-600 leading-relaxed">
                  Regularly update your partner company list to keep student opportunities fresh.
                </p>
              </div>
            </GlassCard>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}
