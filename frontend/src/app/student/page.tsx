'use client';

import React, { useEffect, useState } from 'react';
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
  UserCircle,
  AlertCircle,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useAppSelector } from '@/redux/hooks';
import { getStudentProfile } from '@/services/student/profile.service';

export default function StudentDashboard() {
  const router = useRouter();
  const user = useAppSelector((state) => state.student.details);
  const [showReminder, setShowReminder] = useState(false);

  
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    const checkProfileCompletion = async () => {
      if (user && user.status === 'ACTIVE') {
        try {
          const profile = await getStudentProfile();
          let score = 30; // Base verified score
          if (profile.phoneNumber) score += 10;
          if (profile.linkedinUrl) score += 10;
          if (profile.githubUrl || profile.portfolioUrl) score += 10;
          if (profile.skills && Object.values(profile.skills).some(arr => Array.isArray(arr) && arr.length > 0)) score += 15;
          if (profile.experience && profile.experience.length > 0) score += 10;
          if (profile.softSkills && profile.softSkills.length > 0) score += 10;
          if (profile.preferences && profile.preferences.preferredRole) score += 10;
          
          const finalScore = Math.min(score, 100);
          
          // Only show reminder if score is strictly less than 100
          if (finalScore < 100) {
            timer = setTimeout(() => setShowReminder(true), 1500);
          }
        } catch (error) {
          console.error("Failed to check profile status", error);
        }
      }
    };
    
    checkProfileCompletion();
    return () => clearTimeout(timer);
  }, [user]);

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
              </div>
           </div>
        </div>
      </div>
    
      {/* Profile Completion Reminder Modal */}
      <AnimatePresence>
        {showReminder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[2rem] shadow-2xl border border-slate-100 max-w-lg w-full p-8 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-400 to-amber-600" />
              
              <button 
                onClick={() => setShowReminder(false)}
                className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>

              <div className="flex items-start gap-5 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                  <AlertCircle size={28} />
                </div>
                <div className="pt-1">
                  <h3 className="text-xl font-black text-slate-900 mb-2 tracking-tight">Complete Your Profile!</h3>
                  <p className="text-slate-500 font-medium text-sm leading-relaxed">
                    HRs and recruiters can currently see your profile, but it looks incomplete. 
                    Adding your skills, experience, and resume increases your chances of getting shortlisted by <strong>80%</strong>.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 w-full">
                <Button 
                  onClick={() => setShowReminder(false)}
                  variant="outline" 
                  className="flex-1 py-4 h-auto rounded-xl font-black text-xs uppercase tracking-widest"
                >
                  Later
                </Button>
                <Button 
                  onClick={() => router.push('/student/profile')}
                  className="flex-[2] bg-amber-500 hover:bg-amber-600 text-white py-4 h-auto rounded-xl font-black text-xs uppercase tracking-widest border-none shadow-lg shadow-amber-500/20"
                >
                  Complete Profile Now
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </DashboardLayout>
  );
}
