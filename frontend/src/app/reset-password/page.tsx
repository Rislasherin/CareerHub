'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, CheckCircle2, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/shared/GlassCard';
import { Button } from '@/components/shared/Button';
import { Input } from '@/components/shared/Input';
import { resetPassword } from '@/services/auth/auth.service';
import { toast } from 'sonner';
import Link from 'next/link';
import { resetPasswordSchema } from '@/utils/validation';
import { z } from 'zod';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    if (password !== confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }
    
    try {
      resetPasswordSchema.parse({ password });
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
    
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (!token) {
      toast.error('Invalid reset link');
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword({ token, password });
      setIsSuccess(true);
      setTimeout(() => router.push('/login'), 2000);
    } catch (err) {
      // Interceptor handles toast error
    } finally {
      setIsLoading(false);
    }
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
          {!isSuccess ? (
            <>
              <h1 className="text-3xl font-black text-slate-900 mb-2">Reset Password</h1>
              <p className="text-slate-500 font-medium mb-8">Enter your new password below to secure your account.</p>

              <form noValidate className="flex flex-col gap-6" onSubmit={handleSubmit}>
                <Input 
                  label="New Password" 
                  type="password"
                  icon={<Lock size={18} />} 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  error={errors.password}
                  required
                />
                <Input 
                  label="Confirm New Password" 
                  type="password"
                  icon={<Lock size={18} />} 
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                  error={errors.confirmPassword}
                  required
                />

                <Button type="submit" fullWidth isLoading={isLoading} disabled={!password || !confirmPassword || isLoading} className="mt-2 disabled:opacity-50">
                  Reset Password
                </Button>
              </form>
            </>
          ) : (
            <div className="py-6 text-center">
              <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={48} />
              </div>
              <h1 className="text-3xl font-black text-slate-900 mb-4">Success!</h1>
              <p className="text-slate-500 font-medium">
                Your password has been reset successfully. Redirecting to login...
              </p>
            </div>
          )}

          {!isSuccess && (
            <div className="mt-10 pt-8 border-t border-slate-100">
              <Link href="/login" className="flex items-center justify-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors">
                <ChevronLeft size={16} />
                Back to Login
              </Link>
            </div>
          )}
        </GlassCard>
      </motion.div>
    </div>
  );
}
