'use client';

import React from 'react';
import Link from 'next/link';
import { User, Briefcase, GraduationCap, Building2, ArrowRight, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const registerRoutes = [
  {
    id: 'student',
    label: 'Student',
    title: 'Candidate',
    description: 'Connect with premium employers and track your career growth.',
    href: '/student/register',
    icon: GraduationCap,
    lightColor: 'bg-indigo-50 text-indigo-600'
  },
  {
    id: 'hr',
    label: 'Company',
    title: 'Employer / HR',
    description: 'Post jobs, manage interviews, and hire top talent from verified colleges.',
    href: '/hr/register',
    icon: Briefcase,
    lightColor: 'bg-indigo-50 text-indigo-600'
  },
  {
    id: 'college',
    label: 'Institution',
    title: 'College / University',
    description: 'Register your campus to streamline placements and verify students.',
    href: '/college/register',
    icon: Building2,
    lightColor: 'bg-indigo-50 text-indigo-600'
  },
  {
    id: 'interviewer',
    label: 'Interviewer',
    title: 'Reviewer',
    description: 'Join a hiring team to conduct interviews and evaluate candidates.',
    href: '/interviewer/register',
    icon: User,
    lightColor: 'bg-indigo-50 text-indigo-600'
  },
];

export default function RegisterSelectionPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-100 flex flex-col">
      {/* Background elements */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_30%,rgba(99,102,241,0.06),transparent_50%),radial-gradient(circle_at_80%_70%,rgba(139,92,246,0.04),transparent_50%)]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex justify-between items-center py-8 px-[10%] border-b border-slate-50 bg-white/50 backdrop-blur-md sticky top-0">
        <Link href="/" className="flex items-center gap-3 text-2xl font-black group">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20 flex items-center justify-center text-white text-lg">CH</div>
          <span className="tracking-tighter">CareerHub</span>
        </Link>
        <Link href="/login" className="text-sm font-black text-slate-500 hover:text-indigo-600 transition-colors uppercase tracking-widest">
          Sign In
        </Link>
      </nav>

      <main className="relative z-10 flex-1 py-20 px-[10%] flex items-center">
        <div className="max-w-6xl mx-auto w-full">
          <div className="mb-20 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-5xl lg:text-7xl font-black text-slate-900 mb-6 tracking-tighter leading-none">
                Get Started with <span className="text-indigo-600">CareerHub</span>
              </h1>
              <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
                Select your role to create your account and join the placement ecosystem.
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {registerRoutes.map((route, index) => (
              <motion.div
                key={route.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <Link href={route.href} className="block h-full group outline-none">
                  <div className="h-full p-10 rounded-[2.5rem] bg-slate-50 border border-slate-100 hover:bg-white hover:border-indigo-200 hover:shadow-[0_20px_50px_-15px_rgba(99,102,241,0.15)] transition-all duration-500 group-hover:-translate-y-2 flex flex-col">
                    <div className={`w-16 h-16 rounded-2xl ${route.lightColor} flex items-center justify-center mb-10 shadow-sm border border-indigo-100/30 group-hover:scale-110 transition-transform duration-500`}>
                      <route.icon size={32} strokeWidth={2.5} />
                    </div>

                    <div className="flex-1">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 block">{route.label}</span>
                      <h3 className="text-2xl font-black text-slate-900 mb-4 group-hover:text-indigo-600 transition-colors tracking-tight">{route.title}</h3>
                      <p className="text-slate-500 text-sm font-medium leading-relaxed mb-10">{route.description}</p>
                    </div>

                    <div className="mt-auto flex items-center gap-2 text-indigo-600 font-black text-xs uppercase tracking-widest">
                      Continue <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform duration-300" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-[10%] border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-50/30">
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">© 2026 CareerHub Inc.</p>
        <div className="flex gap-10">
          <a href="#" className="text-[10px] font-black text-slate-400 hover:text-indigo-600 uppercase tracking-widest transition-colors">Privacy</a>
          <a href="#" className="text-[10px] font-black text-slate-400 hover:text-indigo-600 uppercase tracking-widest transition-colors">Terms</a>
          <a href="#" className="text-[10px] font-black text-slate-400 hover:text-indigo-600 uppercase tracking-widest transition-colors">Support</a>
        </div>
      </footer>
    </div>
  );
}
