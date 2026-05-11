'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  GraduationCap, 
  Building2, 
  Briefcase, 
  ShieldCheck, 
  Mail, 
  Lock, 
  ArrowRight,
  ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '@/components/shared/GlassCard';
import { Button } from '@/components/shared/Button';
import { Input } from '@/components/shared/Input';
import { useAuth } from '@/context/AuthContext';
import { loginUser, UserRole } from '@/services/auth/auth.service';
import { toast } from 'sonner';

const roles: { id: UserRole; label: string; icon: any; color: string }[] = [
  { id: 'student', label: 'Student', icon: GraduationCap, color: '#0ea5e9' },
  { id: 'hr', label: 'Company', icon: Building2, color: '#8b5cf6' },
  { id: 'college_admin', label: 'Institution', icon: GraduationCap, color: '#10b981' },
  { id: 'interviewer', label: 'Interviewer', icon: Briefcase, color: '#6366f1' },
  { id: 'super_admin', label: 'Admin', icon: ShieldCheck, color: '#0f172a' },
];

export default function UnifiedLoginPage() {
  const [activeRole, setActiveRole] = useState<UserRole>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { user, isFirstLogin } = await loginUser(activeRole, { email, password });
      login(user);
      toast.success(`Logged in as ${user.firstName}`);
      
      const roleRedirects: Record<UserRole, string> = {
        student: isFirstLogin ? '/student/setup' : '/student',
        hr: '/hr',
        college_admin: '/college',
        interviewer: '/interviewer',
        super_admin: '/admin'
      };
      
      router.push(roleRedirects[activeRole]);
    } catch (err) {
      // Interceptor handles toast
    } finally {
      setIsLoading(false);
    }
  };

  const activeRoleData = roles.find(r => r.id === activeRole)!;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50">
      {/* Left Panel - Hero Branding */}
      <div className="hidden lg:flex flex-1 flex-col p-16 bg-gradient-to-br from-indigo-50 to-purple-50 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_30%,rgba(14,165,233,0.15),transparent_50%),radial-gradient(circle_at_80%_70%,rgba(139,92,246,0.15),transparent_50%)]" />
        </div>
        
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3 text-2xl font-extrabold text-slate-900">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30 flex items-center justify-center text-white text-lg">CH</div>
            <span>CareerHub</span>
          </Link>
        </div>

        <div className="relative z-10 my-auto max-w-lg">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeRole}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="text-6xl font-black leading-[1.1] text-slate-900 mb-8 tracking-tight">
                {activeRole === 'student' && <>Empowering <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">Your Career</span></>}
                {activeRole === 'hr' && <>Scale Your <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">Hiring Team</span></>}
                {activeRole === 'college_admin' && <>Manage Your <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">Institution</span></>}
                {activeRole === 'interviewer' && <>Conduct Better <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">Interviews</span></>}
                {activeRole === 'super_admin' && <>Platform <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">Administration</span></>}
              </h1>
              <p className="text-xl text-slate-500 leading-relaxed">
                Access your dedicated portal and manage your placements with ease. Built for modern professionals.
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white relative">
        <div className="absolute top-8 left-8">
          <Link href="/" className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors">
            <ChevronLeft size={16} /> Back to home
          </Link>
        </div>

        <GlassCard className="w-full max-w-md p-10 border-none shadow-none lg:shadow-none bg-transparent">
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-black text-slate-900 mb-2">Sign In</h2>
            <p className="text-slate-500 font-medium">Select your portal and enter credentials</p>
          </div>

          {/* Role Selector Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-2xl mb-8 overflow-x-auto no-scrollbar">
            {roles.map(role => (
              <button
                key={role.id}
                onClick={() => setActiveRole(role.id)}
                className={`
                  flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200
                  ${activeRole === role.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}
                `}
                style={{ color: activeRole === role.id ? role.color : undefined }}
              >
                <role.icon size={14} />
                {role.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-6">
            <Input 
              label={`${activeRoleData.label} Email`}
              type="email" 
              icon={<Mail size={18} />} 
              placeholder={activeRole === 'student' ? 'student@university.edu' : 'name@company.com'}
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
                <Link href="/forgot-password" className="text-xs font-bold transition-colors hover:opacity-80" style={{ color: activeRoleData.color }}>
                  Forgot password?
                </Link>
              </div>
            </div>

            <Button 
              type="submit" 
              fullWidth 
              isLoading={isLoading}
              className="mt-4"
              style={{ background: activeRoleData.color }}
            >
              Sign In to {activeRoleData.label} <ArrowRight size={18} />
            </Button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-sm font-medium text-slate-400">
              Don't have an account? <Link href="/register-selection" className="font-bold transition-colors hover:opacity-80" style={{ color: activeRoleData.color }}>Get Started</Link>
            </p>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
