'use client';
import { API_ROUTES } from '@/constants/api.routes';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  GraduationCap,
  ShieldCheck,
  Building2,
  TrendingUp,
  FileUp,
  ChevronRight,
  Users,
  Search,
  Bell,
  CheckCircle2,
  Clock,
  IndianRupee,
  Calendar,
  MoreVertical,
  Plus,
  ArrowUp,
  ExternalLink,
  Star,
  FileSpreadsheet
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/shared/Button';
import { GlassCard } from '@/components/shared/GlassCard';
import { apiClient } from '@/services/api/api.client';
import { useAppSelector } from '@/redux/hooks';

export default function CollegeDashboard() {
  const [dynamicStats, setDynamicStats] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const response: any = await apiClient.get(API_ROUTES.COLLEGE.DASHBOARD_STATS);
        if (response.success) {
          setDynamicStats(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const stats = [
    { label: 'Total Registered', value: dynamicStats?.totalStudents || '0', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50', trend: 'Batch 2024-25' },
    { label: 'Pending Verification', value: dynamicStats?.pendingVerification || '0', icon: ShieldCheck, color: 'text-amber-600', bg: 'bg-amber-50', trend: 'Review needed' },
    { label: 'Active Companies', value: dynamicStats?.totalCompanies || '0', icon: Building2, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: 'Onboarded' },
    { label: 'Active Drives', value: '0', icon: Calendar, color: 'text-rose-600', bg: 'bg-rose-50', trend: 'Coming Soon' },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-[1600px] mx-auto flex flex-col gap-8 pb-12">

        {/* Header */}
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
              {useAppSelector(state => state.collegeAdmin.details?.collegeName) || 'College Console'}
            </h1>
            <p className="text-slate-500 font-medium">Manage student identities, company registrations, and placement drives.</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/college/students">
              <Button variant="outline" className="rounded-xl border-slate-200 h-12 px-6 text-xs font-black gap-2 shadow-sm bg-white">
                <FileSpreadsheet size={18} /> Student Directory
              </Button>
            </Link>
            <button className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-emerald-600 transition-all shadow-sm">
              <Bell size={20} />
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm group hover:shadow-xl transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-6`}>
                <stat.icon size={24} />
              </div>
              <div className="space-y-1">
                <span className="text-4xl font-black text-slate-900 block">{stat.value}</span>
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest block">{stat.label}</span>
              </div>
              <div className="mt-6 pt-6 border-t border-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {stat.trend}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Student Management Focus */}
          <div className="lg:col-span-2 space-y-8">
            <section className="p-10 lg:p-12 rounded-[3rem] bg-indigo-600 text-white overflow-hidden shadow-2xl shadow-indigo-500/20 relative">
              <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-white/10 to-transparent pointer-events-none" />
              <div className="relative z-10">
                <h2 className="text-3xl font-black mb-4 tracking-tight">Onboard your Students</h2>
                <p className="text-indigo-100 font-medium text-lg max-w-lg mb-8">
                  The verification window is open. Start approving student identities or bulk-invite them via CSV to begin the placement season.
                </p>
                <div className="flex gap-4">
                  <Link href="/college/students">
                    <Button className="bg-white text-indigo-600 hover:bg-indigo-50 px-8 py-4 h-auto rounded-2xl font-black text-xs uppercase tracking-widest border-none">Review Requests</Button>
                  </Link>
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/5 px-8 py-4 h-auto rounded-2xl font-black text-xs uppercase tracking-widest">Download Template</Button>
                </div>
              </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <GlassCard className="p-10 rounded-[2.5rem] border-slate-100">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-8">Company Portal</h3>
                <p className="text-slate-500 font-bold mb-8">
                  Invite companies to register on CareerHub to start posting jobs and scheduling drives.
                </p>
                <Button fullWidth className="bg-slate-900 text-white hover:bg-slate-800 py-4 h-auto rounded-xl font-black text-[10px] uppercase tracking-widest border-none">Invite Company</Button>
              </GlassCard>

              <GlassCard className="p-10 rounded-[2.5rem] border-slate-100">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-8">Placement Drives</h3>
                <div className="flex flex-col items-center justify-center py-4 text-center">
                  <Calendar size={48} className="text-slate-200 mb-4" />
                  <p className="text-xs font-bold text-slate-400">Drives will appear here once companies start posting requirements.</p>
                </div>
              </GlassCard>
            </div>
          </div>

          {/* Quick Stats / Activity */}
          <div className="space-y-8">
            <GlassCard className="p-10 rounded-[2.5rem] border-slate-100">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-8">Recent Activity</h3>
              <div className="space-y-8">
                {[
                  { text: 'System initialized for new academic year', time: 'Online' },
                  { text: 'College profile verified', time: 'Active' },
                ].map((act, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-slate-700">{act.text}</p>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{act.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

            <div className="p-10 rounded-[2.5rem] bg-amber-500 text-[#0B0D17] flex flex-col gap-6">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                <Star size={24} fill="currentColor" />
              </div>
              <h3 className="text-xl font-black tracking-tight">Pro Features Active</h3>
              <p className="text-[#0B0D17]/70 text-sm font-medium leading-relaxed">
                You have access to unlimited student registrations and bulk CSV tools.
              </p>
            </div>
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}



