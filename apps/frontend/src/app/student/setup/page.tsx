'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Lock, 
  Eye, 
  EyeOff, 
  GraduationCap, 
  CheckCircle2,
  ShieldAlert
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/shared/Button';
import { Input } from '@/components/shared/Input';
import { apiClient } from '@/services/api/api.client';
import { toast } from 'sonner';
import { useAppDispatch } from '@/redux/hooks';
import { setAuth } from '@/redux/slices/authSlice';
import { setStudentDetails } from '@/redux/slices/studentSlice';
import { studentSetupSchema } from '@/utils/validation';
import { z } from 'zod';

export default function StudentSetupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse text-slate-400 font-medium text-lg tracking-tighter">Initializing Portal...</div>
      </div>
    }>
      <SetupContent />
    </Suspense>
  );
}

function SetupContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [studentInfo, setStudentInfo] = useState<{ firstName: string; lastName: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  React.useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setIsVerifying(false);
        return;
      }
      try {
        const response: any = await apiClient.get(`/auth/student/verify-token/${token}`);
        if (response.success) {
          setStudentInfo(response.data);
        }
      } catch (err) {
        // Token invalid or expired
      } finally {
        setIsVerifying(false);
      }
    };
    verifyToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    if (password !== confirmPassword) {
      setErrors({ confirmPassword: "Passwords don't match" });
      return;
    }

    try {
      studentSetupSchema.parse({ password });
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
      const response: any = await apiClient.post('/auth/student/setup-password', { token, password });
      const { user } = response.data;
      
      // Auto-login the student
      dispatch(setAuth({ role: 'student' }));
      dispatch(setStudentDetails(user));
      
      setIsSuccess(true);
      toast.success('Account setup successful!');
      
      // Redirect to verification after a short delay
      setTimeout(() => {
        router.push('/student/verify');
      }, 2000);
    } catch (err: any) {
      // Handled by interceptor
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Verifying Invitation...</p>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-xl p-12 text-center border border-slate-100">
          <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mb-8 mx-auto shadow-sm">
            <ShieldAlert size={40} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-4 tracking-tighter">Invalid Link</h1>
          <p className="text-slate-500 font-medium mb-8 leading-relaxed">
            The invitation link you followed is invalid or has expired. Please contact your college admin for a new link.
          </p>
          <Button 
            fullWidth 
            onClick={() => router.push('/login?role=student')}
            className="h-14 bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest text-xs rounded-2xl transition-all"
          >
            Back to Login
          </Button>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-12 text-center border border-slate-100"
        >
          <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mb-8 mx-auto shadow-sm">
            <CheckCircle2 size={40} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-4 tracking-tighter">Profile Activated</h1>
          <p className="text-slate-500 font-medium mb-8 leading-relaxed">
            Your password has been set. You will be redirected to the login page shortly to complete your verification.
          </p>
          <div className="flex justify-center">
             <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-100/50 rounded-full blur-3xl -mr-64 -mt-64 z-0" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-violet-100/50 rounded-full blur-3xl -ml-64 -mb-64 z-0" />

      <div className="w-full max-w-lg relative z-10">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-white rounded-[1.75rem] shadow-2xl shadow-indigo-200/50 flex items-center justify-center mb-8 mx-auto border border-slate-50">
             <GraduationCap size={40} className="text-indigo-600" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter leading-none">Complete Setup</h1>
          <p className="text-slate-500 font-medium text-lg leading-relaxed">Set your secure password to access the portal.</p>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] p-10 md:p-14 border border-slate-50">
          <form noValidate onSubmit={handleSubmit} className="space-y-8">
            {studentInfo && (
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Student Name</label>
                <div className="relative group">
                   <div className="absolute left-6 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xs">
                      {studentInfo.firstName[0]}{studentInfo.lastName[0]}
                   </div>
                   <input 
                    readOnly 
                    value={`${studentInfo.firstName} ${studentInfo.lastName}`}
                    className="w-full h-16 bg-slate-50 border border-slate-100 rounded-2xl pl-16 pr-6 text-sm font-bold text-slate-600 outline-none cursor-default"
                   />
                </div>
              </div>
            )}

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">New Password</label>
              <div className="relative group">
                <Input 
                  type={showPassword ? "text" : "password"} 
                  icon={<Lock size={20} className="text-slate-400 group-focus-within:text-indigo-500 transition-colors" />} 
                  placeholder="Create a strong password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  error={errors.password}
                  required 
                  className="h-16 bg-slate-50 border-slate-100 focus:bg-white transition-all rounded-2xl text-base px-6 shadow-sm focus:shadow-indigo-100"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <p className="text-[10px] text-slate-400 font-medium px-2">Must be at least 8 characters long.</p>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Confirm Password</label>
              <Input 
                type={showPassword ? "text" : "password"} 
                icon={<Lock size={20} className="text-slate-400 group-focus-within:text-indigo-500 transition-colors" />} 
                placeholder="Repeat your password" 
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                error={errors.confirmPassword}
                required 
                className="h-16 bg-slate-50 border-slate-100 focus:bg-white transition-all rounded-2xl text-base px-6 shadow-sm focus:shadow-indigo-100"
              />
            </div>

            <Button 
              type="submit" 
              fullWidth 
              isLoading={isLoading}
              className="h-16 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-2xl shadow-indigo-500/30 active:scale-[0.98] transition-all border-none"
            >
              Activate Account
            </Button>
          </form>
        </div>
        
        <p className="text-center mt-12 text-slate-400 text-xs font-bold uppercase tracking-widest">
          Secure Onboarding by CareerHub
        </p>
      </div>
    </div>
  );
}
