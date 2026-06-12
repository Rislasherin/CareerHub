'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/shared/Button';
import {
   Building2,
   GraduationCap,
   Briefcase,
   ChevronRight,
   CheckCircle,
   MoreVertical,
   Activity,
   CreditCard,
   LayoutDashboard,
   Users,
   TrendingUp,
   Cpu,
   ShieldCheck,
   Plus,
   RefreshCcw,
   Zap,
   ArrowUpRight,
   ShieldAlert,
   Clock,
   Circle,
   BarChart3,
   Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { superAdminService } from '@/services/super-admin/super-admin.service';
import { toast } from 'sonner';
import { useAppSelector } from '@/redux/hooks';
import { RootState } from '@/redux/store';

export default function SuperAdminDashboard() {
   const [stats, setStats] = useState<type>(null);
   const [isLoading, setIsLoading] = useState(true);

   useEffect(() => {
      const fetchStats = async () => {
         try {
            const res = await superAdminService.getStats();
            setStats(res);
         } catch (err) { }
         setIsLoading(false);
      };
      fetchStats();
   }, []);

   const metrics = [
      { label: 'TOTAL COLLEGES', value: stats?.organizations || '47', trend: '+6 this month', icon: Building2, color: 'text-cyan-400' },
      { label: 'ACTIVE STUDENTS', value: stats?.students?.toLocaleString() || '12,847', trend: '+1,240', icon: GraduationCap, color: 'text-emerald-400' },
      { label: 'MRR', value: '₹38.2L', trend: '+12.4%', icon: CreditCard, color: 'text-indigo-400' },
      { label: 'AI CALLS / DAY', value: '8,432', trend: '+18%', icon: Zap, color: 'text-amber-400' },
      { label: 'RENEWALS DUE', value: '3', trend: 'Next: 8 days', icon: Clock, color: 'text-rose-400' },
   ];

   return (
      <DashboardLayout>
         <div className="max-w-[1600px] mx-auto p-4 lg:p-8 flex flex-col gap-8">

            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
               <div>
                  <div className="flex items-center gap-3 mb-1">
                     <h1 className="text-3xl font-black text-white tracking-tight">Dashboard</h1>
                     <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        All Systems Operational
                     </div>
                  </div>
                  <p className="text-slate-500 text-sm font-medium">CareerHub Platform — Super Admin Control Center</p>
               </div>
               <div className="flex items-center gap-3">
                  <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-400 hover:text-white transition-all">
                     <ShieldAlert size={14} className="text-amber-500" />
                     3 Renewals Due
                  </button>
                  <Button className="bg-cyan-500 hover:bg-cyan-600 text-[#0B0D17] font-black text-xs rounded-xl px-6 h-10 border-none shadow-lg shadow-cyan-500/20">
                     <Plus size={16} className="mr-2" /> Add College
                  </Button>
               </div>
            </header>

            {/* Welcome Banner */}
            <section className="relative group">
               <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 rounded-[2.5rem] blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
               <div className="relative p-10 lg:p-14 rounded-[2.5rem] bg-[#121520] border border-white/5 overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-10">
                  <div className="space-y-6">
                     <div className="inline-flex items-center gap-2 text-cyan-400 text-[10px] font-black uppercase tracking-[0.2em]">
                        PLATFORM OVERVIEW
                     </div>
                     <h2 className="text-5xl font-black text-white tracking-tight leading-tight">
                        Good morning, {useAppSelector((state: RootState) => state.superAdmin.details?.firstName) || 'Admin'} 👋
                     </h2>
                     <p className="text-slate-400 font-medium text-lg max-w-2xl">
                        Placement Season {new Date().getFullYear()}-{new Date().getFullYear() + 1} is active. You are currently overseeing <span className="text-white font-bold">{stats?.organizations || 0} colleges</span>, <span className="text-white font-bold">{stats?.companies || 0} companies</span>, and <span className="text-white font-bold">{stats?.students?.toLocaleString() || 0} students</span>.
                     </p>
                     <div className="flex flex-wrap gap-4 pt-4">
                        <Button
                           onClick={() => window.location.href = '/admin/colleges'}
                           className="bg-cyan-500 text-[#0B0D17] hover:bg-cyan-400 px-8 py-4 h-auto rounded-2xl font-black shadow-xl shadow-cyan-500/10 border-none"
                        >
                           Manage Colleges
                        </Button>
                     </div>
                  </div>
                  <div className="hidden lg:block relative">
                     {/* Decorative Elements */}
                     <div className="w-80 h-80 rounded-full bg-gradient-to-br from-cyan-500/10 to-transparent border border-white/5 flex items-center justify-center relative">
                        <LayoutDashboard size={120} className="text-cyan-500/20" />
                        <div className="absolute top-0 right-0 p-4 bg-[#121520] border border-white/10 rounded-2xl shadow-2xl">
                           <TrendingUp size={32} className="text-emerald-400" />
                        </div>
                     </div>
                  </div>
               </div>
            </section>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
               {metrics.map((metric, i) => (
                  <motion.div
                     key={metric.label}
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: i * 0.1 }}
                     className="p-6 rounded-3xl bg-[#121520] border border-white/5 flex flex-col gap-4 group hover:border-cyan-500/30 transition-all cursor-default"
                  >
                     <div className="flex justify-between items-start">
                        <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${metric.color} group-hover:scale-110 transition-transform`}>
                           <metric.icon size={20} />
                        </div>
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{metric.label}</div>
                     </div>
                     <div>
                        <div className="text-3xl font-black text-white mb-1">{metric.value}</div>
                        <div className="flex items-center gap-2">
                           <span className={`text-[10px] font-black ${metric.trend.includes('+') ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {metric.trend.includes('+') ? '↑' : ''} {metric.trend}
                           </span>
                           {i === 0 && <span className="text-[9px] font-bold text-slate-600">this month</span>}
                        </div>
                     </div>
                  </motion.div>
               ))}
            </div>

            {/* Charts & Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               {/* Revenue Chart Placeholder */}
               <div className="lg:col-span-2 p-8 lg:p-10 rounded-[2.5rem] bg-[#121520] border border-white/5 flex flex-col gap-8">
                  <div className="flex items-center justify-between">
                     <div>
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">MONTHLY REVENUE</h3>
                        <div className="text-4xl font-black text-white">₹4.58Cr <span className="text-sm font-medium text-slate-500 ml-2">YTD</span></div>
                     </div>
                     <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end">
                           <span className="text-xs font-bold text-slate-500 uppercase">Growth</span>
                           <span className="text-sm font-black text-emerald-400">+23.4%</span>
                        </div>
                     </div>
                  </div>

                  {/* Simplified Bar Chart CSS/HTML */}
                  <div className="flex-1 flex items-end justify-between h-64 px-4 gap-3">
                     {[20, 35, 25, 40, 30, 45, 35, 50, 40, 60, 55, 75].map((val, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                           <div className="w-full relative bg-slate-800 rounded-t-lg transition-all group-hover:bg-cyan-500/40" style={{ height: `${val}%` }}>
                              {i === 11 && <div className="absolute -top-1 w-full h-1.5 bg-cyan-400 rounded-full blur-[2px]" />}
                           </div>
                           <span className="text-[9px] font-bold text-slate-600 uppercase tracking-tighter">
                              {['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'][i]}
                           </span>
                        </div>
                     ))}
                  </div>

                  <div className="flex items-center gap-8 pt-4 border-t border-white/5">
                     <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-indigo-500" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">BASIC PLANS: ₹1.89Cr</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-cyan-500" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">PRO PLANS: ₹2.69Cr</span>
                     </div>
                  </div>
               </div>

               {/* Recent Activity */}
               <div className="p-8 lg:p-10 rounded-[2.5rem] bg-[#121520] border border-white/5 flex flex-col">
                  <div className="flex items-center justify-between mb-8">
                     <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">RECENT ACTIVITY</h3>
                     <button className="text-xs font-bold text-cyan-400 hover:underline">View all</button>
                  </div>
                  <div className="flex-1 space-y-8">
                     {[
                        { title: 'IIT Madras onboarded', time: '2 hrs ago', icon: Building2, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
                        { title: 'NIT Trichy renewed Pro plan', time: '4 hrs ago', icon: RefreshCcw, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
                        { title: 'SRM Chennai — tokens at 91%', time: '5 hrs ago', icon: ShieldAlert, color: 'text-amber-400', bg: 'bg-amber-400/10' },
                        { title: 'BITS Pilani invoice sent', time: 'Yesterday', icon: CreditCard, color: 'text-slate-400', bg: 'bg-slate-400/10' },
                        { title: 'Amity trial expires in 3 days', time: 'Yesterday', icon: Clock, color: 'text-rose-400', bg: 'bg-rose-400/10' },
                     ].map((act, i) => (
                        <div key={i} className="flex items-start gap-4">
                           <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${act.bg} ${act.color}`}>
                              <act.icon size={16} />
                           </div>
                           <div className="flex flex-col">
                              <span className="text-sm font-bold text-white">{act.title}</span>
                              <span className="text-[10px] font-medium text-slate-500">{act.time}</span>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </div>

            {/* Bottom Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               {/* Renewals */}
               <div className="p-8 lg:p-10 rounded-[2.5rem] bg-[#121520] border border-white/5">
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-8">RENEWALS DUE SOON</h3>
                  <div className="space-y-6">
                     {[
                        { name: 'SRM Chennai', amount: '₹2,40,000', days: '3D', color: 'text-rose-400', border: 'border-rose-400/20' },
                        { name: 'IIT Bombay', amount: '₹2,40,000', days: '8D', color: 'text-amber-400', border: 'border-amber-400/20' },
                        { name: 'Amity Noida', amount: '₹2,40,000', days: '12D', color: 'text-slate-400', border: 'border-slate-400/20' },
                     ].map((r, i) => (
                        <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-transparent hover:border-white/10 transition-all">
                           <div>
                              <div className="text-sm font-bold text-white">{r.name}</div>
                              <div className="text-[10px] font-bold text-slate-500">{r.amount}</div>
                           </div>
                           <div className={`px-2 py-1 rounded-md bg-white/5 border ${r.border} text-[10px] font-black ${r.color}`}>
                              {r.days}
                           </div>
                        </div>
                     ))}
                  </div>
               </div>

               {/* Plan Distribution */}
               <div className="p-8 lg:p-10 rounded-[2.5rem] bg-[#121520] border border-white/5">
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-8">PLAN DISTRIBUTION</h3>
                  <div className="space-y-10">
                     <div className="space-y-3">
                        <div className="flex justify-between items-end">
                           <span className="text-sm font-bold text-white">Pro Plan</span>
                           <span className="text-[10px] font-black text-cyan-400">31 colleges</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                           <div className="h-full w-[65%] bg-cyan-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
                        </div>
                     </div>
                     <div className="space-y-3">
                        <div className="flex justify-between items-end">
                           <span className="text-sm font-bold text-white">Basic Plan</span>
                           <span className="text-[10px] font-black text-amber-400">16 colleges</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                           <div className="h-full w-[35%] bg-amber-500 rounded-full" />
                        </div>
                     </div>
                  </div>
               </div>

               {/* Quick Actions */}
               <div className="p-8 lg:p-10 rounded-[2.5rem] bg-[#121520] border border-white/5">
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-8">QUICK ACTIONS</h3>
                  <div className="grid grid-cols-1 gap-3">
                     <Button fullWidth className="bg-cyan-500 text-[#0B0D17] hover:bg-cyan-400 rounded-xl h-12 font-black text-xs uppercase tracking-widest border-none">
                        <Plus size={16} className="mr-2" /> Add College
                     </Button>
                     {[
                        { label: 'Manage AI Tokens', icon: Cpu },
                        { label: 'View Subscriptions', icon: Star },
                        { label: 'Broadcast to Colleges', icon: ShieldCheck },
                        { label: 'Platform Analytics', icon: BarChart3 },
                     ].map((item, i) => (
                        <button key={i} className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all text-xs font-bold border border-transparent hover:border-white/5">
                           <item.icon size={16} className="text-cyan-500/50" />
                           {item.label}
                        </button>
                     ))}
                  </div>
               </div>
            </div>

         </div>
      </DashboardLayout>
   );
}
