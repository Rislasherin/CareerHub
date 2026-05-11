'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GraduationCap, Mail, Lock, ArrowRight, ChevronLeft } from 'lucide-react';
import { GlassCard } from '@/components/shared/GlassCard';
import { Button } from '@/components/shared/Button';
import { Input } from '@/components/shared/Input';
import { useAuth } from '@/context/AuthContext';
import { loginUser } from '@/services/auth/auth.service';
import { toast } from 'sonner';

export default function StudentLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { user, isFirstLogin } = await loginUser('student', { email, password });
      login(user);
      toast.success(`Welcome back, ${user.firstName}!`);
      if (isFirstLogin) {
        router.push('/student/setup');
      } else {
        router.push('/student');
      }
    } catch {
      // Errors are handled by the apiClient interceptor
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.05),transparent)]">
      <Link href="/login" className="absolute top-8 left-8 flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors">
        <ChevronLeft size={16} /> Back to portals
      </Link>

      <GlassCard className="max-w-[450px] w-full p-10">
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto mb-6 shadow-sm">
            <GraduationCap size={28} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Student Portal</h1>
          <p className="text-slate-500 text-sm font-medium">Sign in to access AI job matches and track your applications.</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-6">
          <Input 
            label="Email Address" 
            type="email" 
            icon={<Mail size={18} />} 
            placeholder="student@university.edu" 
            value={email} 
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} 
            required 
          />
          <div className="flex flex-col gap-2">
            <Input 
              label="Password" 
              type="password" 
              icon={<Lock size={18} />} 
              placeholder="••••••••" 
              value={password} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} 
              required 
            />
            <div className="flex justify-end">
              <Link href="/forgot-password" title="Forgot password?" className="text-xs font-bold text-sky-600 hover:text-sky-700 transition-colors">Forgot password?</Link>
            </div>
          </div>
          <Button type="submit" fullWidth isLoading={isLoading} className="mt-2 bg-sky-600 hover:bg-sky-700">
            Sign In <ArrowRight size={18} className="ml-2" />
          </Button>
        </form>

        <div className="mt-10 pt-8 border-t border-slate-100 text-center">
          <p className="text-[13px] font-medium text-slate-400 mb-3">Student accounts are provided by your institution.</p>
          <Link href="/login" className="text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors underline underline-offset-4">Sign in as a different role</Link>
        </div>
      </GlassCard>
    </div>
  );
}
