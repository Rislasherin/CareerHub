'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/shared/GlassCard';
import { Button } from '@/components/shared/Button';
import { Input } from '@/components/shared/Input';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitted(true);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_30%,rgba(99,102,241,0.05),transparent_50%)]" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <GlassCard className="p-10">
          {!isSubmitted ? (
            <>
              <h1 className="text-3xl font-black text-slate-900 mb-2">Forgot Password?</h1>
              <p className="text-slate-500 font-medium mb-8">Enter your email and we'll send you a secure link to reset your password.</p>

              <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
                <Input 
                  label="Email Address" 
                  type="email"
                  icon={<Mail size={18} />} 
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  required
                />

                <Button type="submit" fullWidth isLoading={isLoading} className="mt-2">
                  Send Reset Link
                </Button>
              </form>
            </>
          ) : (
            <div className="py-6 text-center">
              <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={48} />
              </div>
              <h1 className="text-3xl font-black text-slate-900 mb-4">Link Sent!</h1>
              <p className="text-slate-500 font-medium">
                We've sent a password reset link to <strong className="text-slate-900">{email}</strong>. 
                Please check your inbox.
              </p>
            </div>
          )}

          <div className="mt-10 pt-8 border-t border-slate-100">
            <Link href="/login" className="flex items-center justify-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors">
              <ArrowLeft size={16} />
              Back to Login
            </Link>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
