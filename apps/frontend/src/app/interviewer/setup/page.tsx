'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { GlassCard } from '@/components/shared/GlassCard';
import { Button } from '@/components/shared/Button';
import { Input } from '@/components/shared/Input';
import { motion, AnimatePresence } from 'framer-motion';

export default function InterviewerSetupPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords don't match");
      return;
    }
    
    // API Call goes here
    console.log('Activating Interviewer Account');
    
    setIsSuccess(true);
    setTimeout(() => {
      router.push('/interviewer');
    }, 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.05),transparent)]">
      <GlassCard className="max-w-[450px] w-full p-10">
        <AnimatePresence mode="wait">
          {!isSuccess ? (
            <motion.div
              key="setup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="text-center mb-10">
                <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <Lock size={28} />
                </div>
                <h1 className="text-3xl font-black text-slate-900 mb-2">Account Setup</h1>
                <p className="text-slate-500 text-sm font-medium">Set your password to activate your interviewer account.</p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <Input 
                  label="New Password" 
                  type="password"
                  icon={<Lock size={18} />} 
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  required 
                />
                
                <Input 
                  label="Confirm Password" 
                  type="password"
                  icon={<Lock size={18} />} 
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                  required 
                />

                <Button type="submit" fullWidth className="mt-4 bg-sky-600 hover:bg-sky-700">
                  Activate Account <ArrowRight size={18} className="ml-2" />
                </Button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-10"
            >
              <div className="flex justify-center mb-6">
                <CheckCircle2 size={64} className="text-emerald-500" />
              </div>
              <h2 className="text-3xl font-black text-slate-900 mb-4">Account Activated!</h2>
              <p className="text-slate-500 font-medium">Redirecting to your dashboard...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>
    </div>
  );
}
