'use client';

import React from 'react';
import Link from 'next/link';
import { GraduationCap, ArrowLeft, Building2 } from 'lucide-react';
import { GlassCard } from '@/components/shared/GlassCard';
import { Button } from '@/components/shared/Button';

export default function StudentRegisterInfoPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.05),transparent)]">
      <GlassCard className="max-w-[500px] w-full p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto mb-6 shadow-sm">
          <GraduationCap size={32} />
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Student Registration</h1>
        <p className="text-slate-500 font-medium leading-relaxed mb-8">
          Student accounts are managed and provided directly by your institution. 
          Please contact your college placement office to receive your access credentials.
        </p>
        
        <div className="p-6 bg-slate-50 rounded-2xl text-left mb-8 border border-slate-100">
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
              <Building2 size={20} />
            </div>
            <div>
              <h4 className="font-black text-slate-900 text-sm mb-1">Already have a setup link?</h4>
              <p className="text-xs font-medium text-slate-500 leading-relaxed">
                If you received an email from your college, please click the link in that email to set up your password.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <Link href="/login" className="w-full">
            <Button fullWidth className="bg-sky-600 hover:bg-sky-700 font-black py-4 rounded-2xl">
              Go to Student Login
            </Button>
          </Link>
          <Link href="/register-selection" className="flex items-center justify-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors">
            <ArrowLeft size={16} /> Back to selection
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}
