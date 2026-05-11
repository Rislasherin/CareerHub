'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Building2, Mail, Lock, ArrowRight, ChevronLeft } from 'lucide-react';
import { GlassCard } from '@/components/shared/GlassCard';
import { Button } from '@/components/shared/Button';
import { Input } from '@/components/shared/Input';
import { useAuth } from '@/context/AuthContext';
import { loginUser } from '@/services/auth/auth.service';
import { toast } from 'sonner';

export default function HRLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { user } = await loginUser('hr', { email, password });
      login(user);
      toast.success(`Welcome back, ${user.firstName}!`);
      router.push('/hr');
    } catch {
      // Handled by interceptor
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,rgba(139, 92, 246, 0.05),transparent)]">
      <Link href="/login" className="absolute top-8 left-8 flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors">
        <ChevronLeft size={16} /> Back to portals
      </Link>

      <GlassCard className="max-w-[450px] w-full p-10">
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-6 shadow-sm">
            <Building2 size={28} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Company Portal</h1>
          <p className="text-slate-500 text-sm font-medium">Sign in to manage hiring and interviewers.</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-6">
          <Input 
            label="Work Email" 
            type="email" 
            icon={<Mail size={18} />} 
            placeholder="hr@company.com" 
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
              <Link href="/forgot-password" title="Forgot password?" className="text-xs font-bold text-purple-600 hover:text-purple-700 transition-colors">Forgot password?</Link>
            </div>
          </div>
          <Button type="submit" fullWidth isLoading={isLoading} className="mt-2 bg-purple-600 hover:bg-purple-700">
            Sign In <ArrowRight size={18} className="ml-2" />
          </Button>
        </form>

        <div className="mt-10 pt-8 border-t border-slate-100 text-center">
          <p className="text-[13px] font-medium text-slate-400 mb-3">
            Don't have an account? <Link href="/hr/register" className="text-purple-600 font-bold hover:underline">Register Company</Link>
          </p>
          <Link href="/login" className="text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors underline underline-offset-4">Sign in as a different role</Link>
        </div>
      </GlassCard>
    </div>
  );
}
