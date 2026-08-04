'use client';

import React from 'react';
import Link from 'next/link';
import { User, Briefcase, GraduationCap, Building2, ArrowRight, ChevronLeft, Sparkles } from 'lucide-react';
import { motion, Variants } from 'framer-motion';

const Logo = ({ white = false }: { white?: boolean }) => (
  <div className="flex items-center gap-3 group cursor-pointer">
    <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-lg shadow-indigo-500/30 overflow-hidden group-hover:scale-105 group-hover:rotate-3 transition-all duration-300">
      <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px] group-hover:bg-transparent transition-all duration-300"></div>
      <Briefcase className="text-white z-10 w-5 h-5 relative right-[-2px] bottom-[-2px]" />
      <GraduationCap className="text-white/90 z-10 w-5 h-5 absolute top-1.5 left-1.5 -rotate-12" />
    </div>
    <span className={`text-2xl font-black tracking-tight transition-colors duration-300 ${white ? 'text-white' : 'bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 group-hover:from-indigo-600 group-hover:to-purple-600'}`}>
      CareerHub
    </span>
  </div>
);

const registerRoutes = [
  {
    id: 'student',
    label: 'Student',
    title: 'Candidate',
    description: 'Connect with premium employers and track your career growth.',
    href: '/student/register',
    icon: GraduationCap,
    gradient: 'from-blue-500 to-cyan-500',
    bgLight: 'bg-blue-50',
    textLight: 'text-blue-600'
  },
  {
    id: 'hr',
    label: 'Company',
    title: 'Employer / HR',
    description: 'Post jobs, manage interviews, and hire top talent from verified colleges.',
    href: '/hr/register',
    icon: Briefcase,
    gradient: 'from-indigo-500 to-purple-500',
    bgLight: 'bg-indigo-50',
    textLight: 'text-indigo-600'
  },
  {
    id: 'college',
    label: 'Institution',
    title: 'College / University',
    description: 'Register your campus to streamline placements and verify students.',
    href: '/college/register',
    icon: Building2,
    gradient: 'from-purple-500 to-pink-500',
    bgLight: 'bg-purple-50',
    textLight: 'text-purple-600'
  },
  {
    id: 'interviewer',
    label: 'Interviewer',
    title: 'Reviewer',
    description: 'Join a hiring team to conduct interviews and evaluate candidates.',
    href: '/interviewer/register',
    icon: User,
    gradient: 'from-emerald-400 to-teal-500',
    bgLight: 'bg-emerald-50',
    textLight: 'text-emerald-600'
  },
];

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 }
  }
};

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

export default function RegisterSelectionPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-500/30 flex flex-col overflow-x-hidden">
      {/* Background elements (Matched with Landing Page) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -30, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/20 blur-[150px]"
        ></motion.div>
        <motion.div
          animate={{ x: [0, -30, 0], y: [0, 30, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/20 blur-[150px]"
        ></motion.div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808005_1px,transparent_1px),linear-gradient(to_bottom,#80808005_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_70%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex justify-between items-center py-6 px-[5%] lg:px-[10%] border-b border-white/20 bg-white/70 backdrop-blur-xl shadow-sm sticky top-0">
        <Link href="/">
          <Logo />
        </Link>
        <div className="flex items-center gap-6">
          <span className="text-sm font-semibold text-slate-500 hidden sm:block">Already have an account?</span>
          <Link href="/login" className="text-sm font-bold text-slate-700 hover:text-indigo-600 transition-colors">
            Log in
          </Link>
        </div>
      </nav>

      <main className="relative z-10 flex-1 py-16 px-[5%] lg:px-[10%] flex flex-col justify-center">
        <div className="max-w-7xl mx-auto w-full">
          
          <div className="mb-16 text-center flex flex-col items-center">
            <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50/80 border border-indigo-100 text-indigo-700 font-semibold text-xs mb-6 backdrop-blur-sm shadow-sm">
              <Sparkles size={14} className="text-indigo-600" />
              <span>Join the Future of Hiring</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl lg:text-6xl font-black text-slate-800 mb-6 tracking-tight leading-none"
            >
              Get Started with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-500 to-emerald-500">CareerHub</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed"
            >
              Select your role below to create your account and join our intelligent placement ecosystem.
            </motion.p>
          </div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
          >
            {registerRoutes.map((route) => (
              <motion.div key={route.id} variants={fadeInUp} className="h-full">
                <Link href={route.href} className="block h-full group outline-none">
                  <div className="h-full p-8 rounded-[2rem] bg-white border border-slate-200 hover:border-transparent hover:shadow-[0_20px_60px_-15px_rgba(99,102,241,0.2)] transition-all duration-500 group-hover:-translate-y-2 flex flex-col relative overflow-hidden">
                    
                    {/* Hover Gradient Overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${route.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
                    
                    {/* Top Accent Line */}
                    <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${route.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>

                    <div className={`relative z-10 w-16 h-16 rounded-2xl ${route.bgLight} flex items-center justify-center mb-8 shadow-sm border border-slate-100 group-hover:scale-110 transition-transform duration-500 bg-white`}>
                      <route.icon size={32} className={route.textLight} strokeWidth={2} />
                      <div className="absolute inset-0 rounded-2xl bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
                    </div>

                    <div className="relative z-10 flex-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">{route.label}</span>
                      <h3 className="text-2xl font-black text-slate-900 mb-3 group-hover:text-indigo-700 transition-colors tracking-tight">{route.title}</h3>
                      <p className="text-slate-500 text-sm leading-relaxed mb-8">{route.description}</p>
                    </div>

                    <div className={`relative z-10 mt-auto flex items-center gap-2 ${route.textLight} font-bold text-sm`}>
                      Continue <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform duration-300" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-16 text-center"
          >
             <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors">
               <ChevronLeft size={16} /> Back to Home
             </Link>
          </motion.div>

        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-200/50 bg-white/50 backdrop-blur-md">
         <div className="max-w-7xl mx-auto py-8 px-[5%] lg:px-[10%] flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-xs font-medium tracking-wide">© {new Date().getFullYear()} CareerHub Inc. All rights reserved.</p>
          <div className="flex gap-8">
            <a href="#" className="text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors">Privacy</a>
            <a href="#" className="text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors">Terms</a>
            <a href="#" className="text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors">Support</a>
          </div>
         </div>
      </footer>
    </div>
  );
}
