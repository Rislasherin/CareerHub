'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { GlassCard } from '@/components/shared/GlassCard';
import { Button } from '@/components/shared/Button';
import { 
  Users, 
  Briefcase, 
  Calendar, 
  ChevronRight, 
  Plus,
  Search,
  Bell,
  CheckCircle2,
  TrendingUp,
  Clock,
  LayoutDashboard,
  ShieldCheck,
  FileText,
  XCircle,
  MessageSquare,
  ArrowUpRight,
  UserCheck,
  Zap,
  Building2
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

import { useAppSelector } from '@/redux/hooks';
import { RootState } from '@/redux/store';

export default function HRDashboard() {
  const hrDetails = useAppSelector((state: RootState) => state.hr.details);
  const stats = [
    { label: 'Total Candidates', value: '0', badge: 'Active', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100', sub: 'No candidates yet' },
    { label: 'Interviews Scheduled', value: '0', badge: 'Upcoming', icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', sub: 'No interviews' },
    { label: 'Hire Requests', value: '0', badge: 'Pending', icon: CheckCircle2, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', sub: 'No requests' },
    { label: 'Offer Letters Sent', value: '0', badge: 'Status', icon: FileText, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', sub: 'No offers' },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50">
      <DashboardLayout>
        <div className="max-w-[1400px] mx-auto p-4 lg:p-8 flex flex-col gap-8">
          
          {/* Header */}
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-400">
               <span>CareerHub</span>
               <ChevronRight size={14} />
               <span className="text-slate-900">Company Console</span>
            </div>
            
            <div className="flex items-center gap-4">
               <div className="relative group w-80">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                  <input 
                    type="text" 
                    placeholder="Search candidates, jobs..." 
                    className="w-full pl-12 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 outline-none transition-all"
                  />
               </div>
               <Link href="/hr/jobs/new">
                 <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl px-6 h-11 border-none">
                    <Plus size={16} className="mr-2" /> Post Job
                 </Button>
               </Link>
               <button className="w-11 h-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-indigo-600 relative transition-all">
                  <Bell size={20} />
               </button>
               <div className="w-11 h-11 rounded-xl bg-indigo-900 text-white flex items-center justify-center font-black text-xs shadow-lg overflow-hidden">
                  <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${hrDetails?.companyName || 'C'}`} alt="logo" />
               </div>
            </div>
          </header>

          {/* Welcome Banner */}
          <section className="relative p-10 lg:p-12 rounded-[2.5rem] bg-indigo-600 text-white overflow-hidden shadow-2xl shadow-indigo-500/20">
             <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-white/10 to-transparent pointer-events-none" />
             <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div>
                   <h2 className="text-4xl font-black mb-3 tracking-tight">Welcome back, {hrDetails?.companyName || 'Partner'}! 👋</h2>
                   <p className="text-indigo-100 font-medium text-lg max-w-2xl">
                     You are currently in the hiring setup phase. Start by posting your job requirements to begin receiving AI-matched candidates.
                   </p>
                </div>
                <div className="flex gap-4">
                   <Link href="/hr/jobs/new">
                     <Button className="bg-white text-indigo-600 hover:bg-indigo-50 px-8 py-4 h-auto rounded-2xl font-black text-xs uppercase tracking-widest border-none">Post First Job <ChevronRight size={16} className="ml-1" /></Button>
                   </Link>
                   <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 px-8 py-4 h-auto rounded-2xl font-black text-xs uppercase tracking-widest">Guidebook</Button>
                </div>
             </div>
          </section>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
             {stats.map((stat, i) => (
               <div key={i} className={`p-8 rounded-[2rem] bg-white border ${stat.border} shadow-sm group hover:shadow-xl hover:shadow-slate-200/50 transition-all cursor-default relative overflow-hidden`}>
                  <div className="absolute top-0 right-0 p-4">
                     <span className={`px-2 py-1 rounded-md ${stat.bg} ${stat.color} text-[8px] font-black uppercase tracking-widest`}>
                        {stat.badge}
                     </span>
                  </div>
                  <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-6 shadow-inner`}>
                     <stat.icon size={24} />
                  </div>
                  <div className="space-y-1">
                     <div className="text-4xl font-black text-slate-900 tracking-tight">{stat.value}</div>
                     <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</div>
                  </div>
                  <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between">
                     <span className="text-[10px] font-bold text-slate-500 truncate">{stat.sub}</span>
                  </div>
               </div>
             ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             {/* Left: Pending Requests */}
             <div className="space-y-8">
                <div className="flex items-center justify-between px-2">
                   <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Pending Hire Requests</h3>
                   <button className="text-[10px] font-black text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest flex items-center gap-1">View All <ChevronRight size={12} /></button>
                </div>
                
                <div className="flex flex-col items-center justify-center p-20 rounded-[2rem] border-2 border-dashed border-slate-100 bg-white/50 text-center">
                   <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-slate-200 mb-6">
                      <Clock size={32} />
                   </div>
                   <p className="text-slate-400 font-bold text-xs max-w-[200px]">
                      No pending hire requests at the moment.
                   </p>
                </div>
             </div>

             {/* Right: Today's Schedule */}
             <div className="space-y-8">
                <div className="flex items-center justify-between px-2">
                   <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Today's Schedule</h3>
                   <button className="text-[10px] font-black text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest flex items-center gap-1">Full Calendar <ChevronRight size={12} /></button>
                </div>
                
                <GlassCard className="p-10 rounded-[2.5rem] border-slate-100 shadow-sm flex flex-col items-center justify-center text-center py-20">
                   <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mb-6">
                      <Calendar size={32} />
                   </div>
                   <p className="text-slate-400 font-bold text-xs max-w-[200px]">
                      Your interview schedule for today is clear.
                   </p>
                </GlassCard>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             {/* Recent Activity */}
             <div className="space-y-8">
                <div className="flex items-center justify-between px-2">
                   <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Recent Activity</h3>
                   <button className="text-[10px] font-black text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest flex items-center gap-1">View all</button>
                </div>
                
                <div className="space-y-8">
                   {[
                     { title: 'Ananya Sharma shortlisted for Software Engineer', time: '2 hours ago', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                     { title: 'Interview invite sent to Rohit Mehra', time: '4 hours ago', icon: MessageSquare, color: 'text-blue-500', bg: 'bg-blue-50' },
                     { title: '8 new AI-matched candidates for Data Analyst', time: 'Yesterday, 6:30 PM', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50' },
                     { title: 'Company profile viewed by IIT Bombay Placements', time: 'Yesterday, 2:10 PM', icon: Building2, color: 'text-slate-500', bg: 'bg-slate-50' },
                   ].map((act, i) => (
                     <div key={i} className="flex gap-4 group">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${act.bg} ${act.color} group-hover:scale-110 transition-transform`}>
                           <act.icon size={18} />
                        </div>
                        <div className="space-y-1">
                           <p className="text-sm font-bold text-slate-900 leading-snug">{act.title}</p>
                           <p className="text-[10px] font-medium text-slate-400">{act.time}</p>
                        </div>
                     </div>
                   ))}
                </div>
             </div>

             {/* Applications Summary Chart */}
             <div className="space-y-8">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Applications This Week</h3>
                <div className="flex items-end justify-between gap-2 h-48 bg-white p-8 rounded-[2rem] border border-slate-100">
                   {[8, 12, 6, 15, 10, 4, 2].map((v, i) => (
                     <div key={i} className="flex-1 flex flex-col items-center gap-2">
                        <div className="w-full bg-indigo-600 rounded-t-lg transition-all hover:bg-indigo-700" style={{ height: `${(v/15)*100}%` }} />
                        <span className="text-[8px] font-black text-slate-400">{['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'][i]}</span>
                     </div>
                   ))}
                </div>
             </div>
          </div>

          {/* Footer: Hiring Funnel & Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             <GlassCard className="p-10 rounded-[2.5rem] border-slate-100 shadow-sm flex flex-col md:flex-row gap-12">
                <div className="flex-1 space-y-8">
                   <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Key Metrics</h3>
                   <div className="space-y-4">
                      {[
                        { label: 'Avg. Interview Score', value: '4.1/5', color: 'text-indigo-600' },
                        { label: 'Shortlist Rate', value: '25%', color: 'text-emerald-600' },
                        { label: 'Avg. Time to Hire', value: '11d', color: 'text-slate-900' },
                        { label: 'Offer Acceptance', value: '100%', color: 'text-emerald-600' },
                        { label: 'Active Interviewers', value: '4', color: 'text-slate-900' },
                      ].map((m, i) => (
                        <div key={i} className="flex justify-between items-center py-3 border-b border-slate-50 last:border-0">
                           <span className="text-xs font-bold text-slate-500">{m.label}</span>
                           <span className={`text-xs font-black ${m.color}`}>{m.value}</span>
                        </div>
                      ))}
                   </div>
                </div>

                <div className="flex-1 space-y-8">
                   <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Hiring Funnel</h3>
                   <div className="space-y-6">
                      {[
                        { label: 'Applied', value: 47, color: 'bg-indigo-600' },
                        { label: 'Reviewed', value: 34, color: 'bg-indigo-400' },
                        { label: 'Shortlisted', value: 12, color: 'bg-amber-400' },
                        { label: 'Interviewed', value: 5, color: 'bg-emerald-500' },
                      ].map((f, i) => (
                        <div key={i} className="space-y-2">
                           <div className="flex justify-between items-end">
                              <span className="text-[10px] font-bold text-slate-500 uppercase">{f.label}</span>
                              <span className="text-xs font-black text-slate-900">{f.value}</span>
                           </div>
                           <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                              <div className={`h-full ${f.color} rounded-full`} style={{ width: `${(f.value/47)*100}%` }} />
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
             </GlassCard>

             <div className="p-10 rounded-[2.5rem] bg-slate-900 text-white flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_30%,rgba(99,102,241,0.1),transparent_70%)] pointer-events-none" />
                <div className="space-y-6 relative z-10">
                   <div className="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                      <ShieldCheck size={24} />
                   </div>
                   <h3 className="text-2xl font-black tracking-tight">Enterprise Scaling</h3>
                   <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-sm">
                      Need to hire for multiple departments? Upgrade your plan to unlock bulk candidate exports and AI-powered interviewer scheduling.
                   </p>
                   <Button className="bg-indigo-600 hover:bg-indigo-500 px-8 py-3.5 h-auto rounded-xl font-black text-xs uppercase tracking-widest border-none shadow-xl shadow-indigo-500/10">View Plans</Button>
                </div>
                <div className="hidden md:block relative z-10">
                   <div className="w-40 h-40 rounded-full border-4 border-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform duration-700">
                      <TrendingUp size={64} className="text-indigo-400" />
                   </div>
                </div>
             </div>
          </div>

        </div>
      </DashboardLayout>
    </div>
  );
}
