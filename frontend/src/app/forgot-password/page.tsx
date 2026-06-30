'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle2, ChevronLeft, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/shared/GlassCard';
import { Button } from '@/components/shared/Button';
import { Input } from '@/components/shared/Input';
import { forgotPassword } from '@/services/auth/auth.service';
import { forgotPasswordSchema } from '@/utils/validation';
import { z } from 'zod';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      forgotPasswordSchema.parse({ email });
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        err.issues.forEach((issue) => {
          if (issue.path[0]) fieldErrors[issue.path[0] as string] = issue.message;
        });
        setErrors(fieldErrors);
        return;
      }
    }

    setIsLoading(true);
    try {
      await forgotPassword(email);
      setIsSubmitted(true);
    } catch (err) {
      // Interceptor handles toast error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-white relative overflow-hidden selection:bg-indigo-100">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_30%,rgba(99,102,241,0.08),transparent_50%),radial-gradient(circle_at_80%_70%,rgba(16,185,129,0.05),transparent_50%)]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-lg relative z-10"
      >
        <Link href="/login" className="absolute -top-12 left-0 inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors group">
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Login
        </Link>

        <GlassCard className="p-12 lg:p-16 border-slate-100/50 shadow-2xl shadow-slate-200/50 rounded-[3rem]">
          {!isSubmitted ? (
            <>
              <div className="mb-12">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-8 shadow-sm">
                  <Sparkles size={28} />
                </div>
                <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Forgot Password?</h1>
                <p className="text-slate-500 font-medium text-lg leading-relaxed">No worries! It happens. Enter your work email and we'll send you a recovery link.</p>
              </div>

              <form noValidate className="flex flex-col gap-8" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Work Email</label>
                  <Input
                    type="email"
                    icon={<Mail size={20} className="text-slate-400" />}
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    error={errors.email}
                    required
                    className="h-16 bg-slate-50 border-slate-100 focus:bg-white text-base font-medium rounded-2xl"
                  />
                </div>

                <Button type="submit" fullWidth isLoading={isLoading} disabled={!email || isLoading} className="h-16 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-500/20 active:scale-[0.98] transition-all bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50">
                  Send Recovery Link
                </Button>
              </form>
            </>
          ) : (
            <div className="py-8 text-center">
              <div className="w-24 h-24 rounded-[2.5rem] bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto mb-10 shadow-sm animate-bounce-subtle">
                <CheckCircle2 size={48} strokeWidth={2.5} />
              </div>
              <h1 className="text-4xl font-black text-slate-900 mb-6 tracking-tight">Check Your Inbox</h1>
              <p className="text-slate-500 font-medium text-lg leading-relaxed mb-8">
                We've sent a secure recovery link to <br />
                <strong className="text-slate-900 font-black decoration-emerald-200 underline underline-offset-4">{email}</strong>
              </p>
              <p className="text-sm font-medium text-slate-400">
                Didn't receive the email? Check your spam folder or <button onClick={() => setIsSubmitted(false)} className="text-indigo-600 font-bold hover:underline underline-offset-2">try another email</button>.
              </p>
            </div>
          )}
        </GlassCard>
      </motion.div>
    </div>
  );
}
