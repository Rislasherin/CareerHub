'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { GlassCard } from '@/components/shared/GlassCard';
import { Button } from '@/components/shared/Button';
import { 
  Zap, 
  Briefcase, 
  Calendar, 
  Star, 
  TrendingUp, 
  ChevronRight,
  ArrowUpRight,
  Search,
  Bell,
  CheckCircle2,
  ShieldCheck,
  UserCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAppSelector } from '@/redux/hooks';

export default function StudentDashboard() {
  const router = useRouter();
  const user = useAppSelector((state) => state.student.details);

  useEffect(() => {
    if (user) {
      if (user.status === 'PENDING_VERIFICATION') {
        router.push('/student/waitlist');
      } else if (user.status === 'REJECTED' || (user.status === 'PENDING_INVITE' && !user.proofUrl)) {
        router.push('/student/verify');
      }
    }
  }, [user, router]);

  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto flex flex-col gap-10">
        
        {/* --- Header --- */}
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">My Dashboard</h1>
            <p className="text-slate-500 font-medium">Welcome back, {user?.firstName || 'Student'}! Your profile is active and verified.</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-indigo-600 transition-all relative">
              <Bell size={20} />
              <span className="absolute top-3 right-3 w-2 h-2 bg-emerald-500 rounded-full border-2 border-white" />
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
               <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden border border-slate-200">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.firstName}`} alt="avatar" />
               </div>
            </div>
          </div>
        </header>

        {/* --- Verification Success Banner --- */}
        <section className="relative p-10 lg:p-12 rounded-[3rem] bg-emerald-600 text-white overflow-hidden shadow-2xl shadow-emerald-500/20">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-white/10 to-transparent pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-[10px] font-black uppercase tracking-widest border border-white/10">
                <ShieldCheck size={14} /> Identity Verified
              </div>
              <h2 className="text-4xl font-black mb-2 tracking-tight">Your Profile is Ready! 🚀</h2>
              <p className="text-emerald-50 font-medium text-lg max-w-2xl">
                Congratulations! Your identity has been verified by the college administration. You can now access the full placement suite.
              </p>
            </div>
            <div className="flex gap-4">
              <Button className="bg-white text-emerald-600 hover:bg-emerald-50 px-8 py-4 h-auto rounded-2xl font-black text-xs uppercase tracking-widest border-none">Complete Profile</Button>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <GlassCard className="p-10 rounded-[2.5rem] border-slate-100 flex flex-col gap-6 lg:col-span-2">
              <div className="flex items-center justify-between">
                 <h3 className="text-xl font-black text-slate-900 tracking-tight">Job Board & Placements</h3>
                 <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest">Coming Soon</span>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
                 <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-3xl flex items-center justify-center mb-6">
                    <Briefcase size={40} />
                 </div>
                 <p className="text-slate-500 font-bold max-w-sm">
                    Companies are currently setting up their drives. You will be notified as soon as job postings matching your profile are live.
                 </p>
              </div>
           </GlassCard>

            <div className="space-y-8 lg:col-span-1">
               <GlassCard className="p-8 rounded-[2.5rem] border-slate-100">
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Profile Completion</h3>
                  <div className="space-y-6">
                     <div className="flex justify-between items-end">
                        <span className="text-2xl font-black text-slate-900">{user?.onboardingStep ? Math.min(Math.round((user.onboardingStep / 4) * 100), 100) : 25}%</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Setup in progress</span>
                     </div>
                     <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-600 transition-all duration-500" style={{ width: `${user?.onboardingStep ? Math.min((user.onboardingStep / 4) * 100, 100) : 25}%` }} />
                     </div>
                     <ul className="space-y-3">
                        <li className={`flex items-center gap-3 text-xs font-bold ${(user?.onboardingStep ?? 0) >= 1 ? 'text-emerald-600' : 'text-slate-400'}`}>
                           {(user?.onboardingStep ?? 0) >= 1 ? <CheckCircle2 size={14} /> : <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-200" />} Basic Information
                        </li>
                        <li className={`flex items-center gap-3 text-xs font-bold ${user?.status === 'ACTIVE' ? 'text-emerald-600' : 'text-slate-400'}`}>
                           {user?.status === 'ACTIVE' ? <CheckCircle2 size={14} /> : <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-200" />} Identity Verification
                        </li>
                        <li className={`flex items-center gap-3 text-xs font-bold ${(user?.onboardingStep ?? 0) >= 3 ? 'text-emerald-600' : 'text-slate-400'}`}>
                           {(user?.onboardingStep ?? 0) >= 3 ? <CheckCircle2 size={14} /> : <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-200" />} Professional Skills
                        </li>
                        <li className={`flex items-center gap-3 text-xs font-bold ${(user?.onboardingStep ?? 0) >= 4 ? 'text-emerald-600' : 'text-slate-400'}`}>
                           {(user?.onboardingStep ?? 0) >= 4 ? <CheckCircle2 size={14} /> : <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-200" />} Resume Upload
                        </li>
                     </ul>
                     <Button 
                       onClick={() => router.push('/student/profile')}
                       fullWidth className="bg-indigo-600 text-white hover:bg-indigo-700 py-4 h-auto rounded-xl font-black text-[10px] uppercase tracking-widest border-none"
                     >
                       {(user?.onboardingStep ?? 0) >= 4 ? 'Update Profile' : 'Finish Profile Setup'}
                     </Button>
                  </div>
               </GlassCard>

              <div className="p-8 rounded-[2.5rem] bg-slate-900 text-white flex flex-col gap-6">
                 <div className="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center">
                    <Star size={24} />
                 </div>
                 <h3 className="text-xl font-black tracking-tight">AI Skill Assessment</h3>
                 <p className="text-slate-400 text-sm font-medium leading-relaxed">
                    Improve your visibility to recruiters by taking our baseline technical assessment.
                 </p>
                 <Button variant="outline" className="border-white/10 text-white hover:bg-white/5 py-4 h-auto rounded-xl font-black text-[10px] uppercase tracking-widest">Start Test</Button>
              </div>
           </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
