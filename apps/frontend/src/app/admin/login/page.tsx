'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, 
  Mail, 
  Lock, 
  Eye,
  EyeOff,
  ChevronLeft
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/shared/Button';
import { Input } from '@/components/shared/Input';
import { loginUser } from '@/services/auth/auth.service';
import { toast } from 'sonner';
import { useAppDispatch } from '@/redux/hooks';
import { setAuth } from '@/redux/slices/authSlice';
import { setSuperAdminDetails } from '@/redux/slices/superAdminSlice';
import { loginSchema } from '@/utils/validation';
import { z } from 'zod';

export default function SuperAdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    // Validate
    try {
      loginSchema.parse({ email, password });
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
      const { user } = await loginUser('super_admin', { email, password });
      
      // Update Redux state
      dispatch(setAuth({ role: user.role }));
      dispatch(setSuperAdminDetails(user));

      toast.success(`Welcome back, ${user.firstName}!`);
      router.push('/admin');
    } catch (err) {
      // Interceptor handles toast
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white font-sans text-slate-900">
      <div className="grid grid-cols-1 lg:grid-cols-2 w-full min-h-screen">
        
        {/* Left Side: Admin Branding */}
        <div className="hidden lg:flex flex-col bg-slate-900 relative p-16 xl:p-24 overflow-hidden">
          <div className="absolute inset-0 z-0">
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(99,102,241,0.1),transparent_60%),radial-gradient(circle_at_70%_70%,rgba(139,92,246,0.08),transparent_60%)]" />
          </div>

          <div className="relative z-10 mb-auto">
            <Link href="/" className="flex items-center gap-3 text-2xl font-black group text-white">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 shadow-lg shadow-indigo-500/30 flex items-center justify-center">CH</div>
              <span className="tracking-tighter">CareerHub</span>
            </Link>
          </div>

          <div className="relative z-10 max-w-lg">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-8 border border-indigo-500/20">
                System Administration
              </div>
              <h1 className="text-6xl xl:text-7xl font-black leading-tight mb-8 tracking-tighter text-white">
                Control the entire ecosystem.
              </h1>
              <p className="text-xl text-slate-400 leading-relaxed font-medium mb-12">
                Monitor platform health, manage multi-tenant configurations, and oversee global security.
              </p>

              <div className="p-8 rounded-[2.5rem] bg-slate-800/50 border border-slate-700 shadow-2xl relative backdrop-blur-sm">
                <div className="absolute -top-4 -left-4 w-10 h-10 bg-indigo-600 text-white flex items-center justify-center rounded-xl font-serif text-3xl italic">"</div>
                <p className="text-lg font-medium text-slate-300 italic mb-8 leading-relaxed">
                  Scalability and security at its finest. The multi-tenant architecture is robust and easy to manage.
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-700 overflow-hidden ring-4 ring-slate-800 shrink-0">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" alt="Admin" className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-white truncate">Admin Team</h4>
                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest truncate">Platform Infrastructure</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="mt-auto relative z-10 pt-12">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">© 2026 CareerHub Administrative Console</p>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="flex items-center justify-center p-8 lg:p-16 xl:p-24 relative bg-white">
          <div className="w-full max-w-md">
            <div className="text-center lg:text-left mb-12">
               <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-8 mx-auto lg:mx-0 shadow-sm border border-indigo-100/30">
                  <ShieldCheck size={32} strokeWidth={2.5} />
               </div>
               <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter leading-none">Admin Login</h2>
               <p className="text-slate-500 font-medium text-lg leading-relaxed">Secure access to the platform command center.</p>
            </div>

            <form noValidate onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Admin Email</label>
                <Input 
                  type="email" 
                  icon={<Mail size={20} className="text-slate-400" />} 
                  placeholder="admin@careerhub.com"
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  error={errors.email}
                  required 
                  className="h-16 bg-slate-50 border-slate-100 focus:bg-white transition-all rounded-2xl text-base px-6"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-end mb-1">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Password</label>
                  <Link href="/forgot-password" title="Forgot password?" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors">Forgot Password?</Link>
                </div>
                <div className="relative group">
                  <Input 
                    type={showPassword ? "text" : "password"} 
                    icon={<Lock size={20} className="text-slate-400" />} 
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                    error={errors.password}
                    required 
                    className="h-16 bg-slate-50 border-slate-100 focus:bg-white transition-all rounded-2xl text-base px-6"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                fullWidth 
                isLoading={isLoading}
                className="h-16 mt-4 bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-2xl shadow-slate-900/30 active:scale-[0.98] transition-all border-none"
              >
                Authenticate
              </Button>
            </form>

            <div className="mt-12 pt-8 border-t border-slate-50">
               <Link href="/login" className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-indigo-600 transition-colors">
                  <ChevronLeft size={16} />
                  <span>Back to Portal Login</span>
               </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
