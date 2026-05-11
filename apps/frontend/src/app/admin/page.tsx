'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { GlassCard } from '@/components/shared/GlassCard';
import { Button } from '@/components/shared/Button';
import { Building2, GraduationCap, Briefcase, Activity, ChevronRight, Settings, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const stats = [
  { label: 'Total Organizations', value: '45', icon: Building2, color: '#f59e0b' },
  { label: 'Total Companies', value: '120', icon: Briefcase, color: '#8b5cf6' },
  { label: 'Registered Students', value: '15.4K', icon: GraduationCap, color: '#0ea5e9' },
  { label: 'Platform Uptime', value: '99.9%', icon: Activity, color: '#10b981' },
];

export default function AdminDashboard() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        {/* --- Welcome Banner --- */}
        <section className="flex flex-col md:flex-row items-center justify-between gap-6 p-10 rounded-[2rem] bg-gradient-to-br from-slate-800 to-slate-950 text-white shadow-2xl shadow-slate-900/20">
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-black mb-2 tracking-tight">Super Admin Dashboard</h1>
            <p className="text-slate-400 font-medium opacity-90">Platform overview and global management control center.</p>
          </div>
          <div className="flex gap-4">
            <Button className="bg-white text-slate-900 hover:bg-slate-100 border-none shadow-lg font-bold">
              <Settings size={18} className="mr-2" /> System Config
            </Button>
          </div>
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
          {/* --- System Alerts --- */}
          <section className="lg:col-span-2 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-text-main">System Alerts</h2>
              <Button variant="ghost" className="text-slate-600 hover:bg-slate-50 font-bold">View Logs <ChevronRight size={16} /></Button>
            </div>

            <div className="flex flex-col gap-4">
              {[
                { title: 'High Traffic Alert', desc: 'Unusual spike in student registrations from IIT Delhi.', type: 'warning' }
              ].map((alert, idx) => (
                <GlassCard key={idx} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 p-6 border-l-4 border-l-amber-500 hover:bg-amber-50/10 transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
                      <AlertTriangle size={20} />
                    </div>
                    <div>
                      <h3 className="font-black text-text-main">{alert.title}</h3>
                      <p className="text-sm font-medium text-text-muted">{alert.desc}</p>
                    </div>
                  </div>
                  <Button variant="outline" className="px-5 py-2 rounded-xl font-bold border-slate-200 hover:border-amber-500 hover:text-amber-500 transition-all">
                    Investigate
                  </Button>
                </GlassCard>
              ))}
            </div>
          </section>

          {/* --- Global Actions --- */}
          <section className="flex flex-col gap-6">
            <h2 className="text-xl font-black text-text-main">Global Actions</h2>
            <GlassCard className="p-8 flex flex-col gap-4">
              <Button fullWidth className="bg-amber-500 hover:bg-amber-600 py-4 rounded-2xl font-bold border-none shadow-lg shadow-amber-500/20 text-white">
                Onboard Organization
              </Button>
              <Button fullWidth variant="outline" className="py-4 rounded-2xl font-bold border-slate-200 hover:border-slate-900 hover:text-slate-900">
                View Platform Analytics
              </Button>
              <Button fullWidth variant="ghost" className="py-4 rounded-2xl font-bold text-rose-600 hover:bg-rose-50">
                System Health Check
              </Button>
              <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-[11px] font-medium text-slate-500 leading-relaxed text-center">
                  You are viewing the production environment. Handle with care.
                </p>
              </div>
            </GlassCard>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}
