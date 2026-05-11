'use client';

import React from 'react';
import Link from 'next/link';
import { User, Briefcase, GraduationCap, Building2, ArrowRight, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/shared/GlassCard';

const registerRoutes = [
  { 
    id: 'college', 
    label: 'College / Institution', 
    description: 'Register your university to manage student placements.',
    href: '/college/register', 
    icon: Building2, 
    color: '#10b981' 
  },
  { 
    id: 'hr', 
    label: 'Company / HR', 
    description: 'Create a company profile and start hiring talent.',
    href: '/hr/register', 
    icon: Briefcase, 
    color: '#8b5cf6' 
  },
  { 
    id: 'student', 
    label: 'Student', 
    description: 'Access your institution-provided account.',
    href: '/student/register', 
    icon: GraduationCap, 
    color: '#0ea5e9' 
  },
  { 
    id: 'interviewer', 
    label: 'Interviewer', 
    description: 'Join your company\'s hiring team.',
    href: '/interviewer/register', 
    icon: User, 
    color: '#334155' 
  },
];

export default function RegisterSelectionPage() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50">
      {/* Left Panel */}
      <div className="hidden lg:flex flex-1 flex-col p-16 bg-gradient-to-br from-emerald-50 to-indigo-50 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_30%,rgba(16,185,129,0.1),transparent_50%),radial-gradient(circle_at_80%_70%,rgba(99,102,241,0.1),transparent_50%)]" />
        </div>

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3 text-2xl font-extrabold text-slate-900">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30 flex items-center justify-center text-white text-lg">CH</div>
            <span>CareerHub</span>
          </Link>
        </div>

        <div className="relative z-10 my-auto max-w-lg">
          <h1 className="text-6xl font-black leading-[1.1] text-slate-900 mb-8 tracking-tight">
            Join the <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-indigo-600">Talent Ecosystem</span>
          </h1>
          <p className="text-xl text-slate-500 leading-relaxed">
            Choose your role to get started with the most advanced placement platform. Connect with opportunities that matter.
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white relative">
        <div className="absolute top-8 left-8">
          <Link href="/" className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors">
            <ChevronLeft size={16} /> Back to home
          </Link>
        </div>
        
        <GlassCard className="w-full max-w-md p-10 border-none shadow-none bg-transparent">
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-black text-slate-900 mb-2">Get Started</h2>
            <p className="text-slate-500 font-medium">Select the account type you want to create</p>
          </div>

          <div className="flex flex-col gap-4">
            {registerRoutes.map((route, index) => (
              <motion.div
                key={route.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={route.href} className="block group no-underline">
                  <div 
                    className="flex items-center justify-between p-5 rounded-2xl border border-slate-100 bg-slate-50/50 transition-all duration-200 hover:translate-y-[-2px] hover:shadow-lg hover:shadow-slate-200/50 hover:bg-white"
                    style={{ borderColor: 'transparent' }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = route.color}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
                  >
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                        style={{ backgroundColor: `${route.color}15`, color: route.color }}
                      >
                        <route.icon size={24} />
                      </div>
                      <div>
                        <span className="text-sm font-extrabold text-slate-900 block">{route.label}</span>
                        <span className="text-[11px] font-medium text-slate-400">{route.description}</span>
                      </div>
                    </div>
                    <ArrowRight size={18} className="text-slate-300 group-hover:text-slate-900 transition-colors" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-10 text-center">
            <p className="text-sm font-medium text-slate-400">
              Already have an account? <Link href="/login" className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors">Log in</Link>
            </p>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
