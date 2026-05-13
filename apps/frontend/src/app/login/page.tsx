'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  GraduationCap, 
  Building2, 
  Briefcase, 
  ShieldCheck, 
  Mail, 
  Lock, 
  Eye,
  EyeOff,
  ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/shared/Button';
import { Input } from '@/components/shared/Input';
import { loginUser, UserRole } from '@/services/auth/auth.service';
import { toast } from 'sonner';
import { useAppDispatch } from '@/redux/hooks';
import { setAuth } from '@/redux/slices/authSlice';
import { setStudentDetails } from '@/redux/slices/studentSlice';
import { setCollegeAdminDetails } from '@/redux/slices/collegeAdminSlice';
import { setHRDetails } from '@/redux/slices/hrSlice';
import { setInterviewerDetails } from '@/redux/slices/interviewerSlice';
import { setSuperAdminDetails } from '@/redux/slices/superAdminSlice';
import { loginSchema } from '@/utils/validation';
import { z } from 'zod';

const roles: { id: UserRole; label: string; icon: any }[] = [
  { id: 'student', label: 'Student', icon: GraduationCap },
  { id: 'hr', label: 'Company', icon: Building2 },
  { id: 'college_admin', label: 'Institution', icon: ShieldCheck },
  { id: 'interviewer', label: 'Interviewer', icon: Briefcase },
];

const roleContent = {
  student: {
    title: "Your gateway to dream careers.",
    subtitle: "Join over 10,000+ students landing jobs at top-tier companies worldwide using CareerHub's AI matching.",
    quote: "CareerHub helped me find a role that perfectly matched my skills. The interview process was seamless.",
    author: "Aditi Sharma",
    position: "Software Engineer at Google"
  },
  hr: {
    title: "The smartest way to manage talent.",
    subtitle: "Join over 2,000+ forward-thinking companies using CareerHub to streamline recruitment and optimize workforce planning.",
    quote: "CareerHub transformed how we handle internal mobility. The AI matching is scary accurate and saves us hours every week.",
    author: "Sarah Jenkins",
    position: "HR Director at TechFlow"
  },
  college_admin: {
    title: "Empower your institution's success.",
    subtitle: "Manage placements, verify student credentials, and connect with global employers in one unified dashboard.",
    quote: "The verification workflow saved our administration hundreds of hours. Highly recommended for any large university.",
    author: "Dr. Rajesh Kumar",
    position: "Dean of Placements, IIT Delhi"
  },
  interviewer: {
    title: "Evaluate talent with precision.",
    subtitle: "Conduct better interviews with structured feedback loops and integrated coding environments.",
    quote: "The interview toolkit is incredible. I can focus on the candidate instead of worrying about the technical setup.",
    author: "Michael Chen",
    position: "Senior Lead at Microsoft"
  }
};

import { useSearchParams } from 'next/navigation';

export default function UnifiedLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse text-slate-400 font-medium text-lg">Loading CareerHub...</div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const searchParams = useSearchParams();
  const [activeRole, setActiveRole] = useState<UserRole>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const dispatch = useAppDispatch();
  const router = useRouter();

  // Handle error messages from query params
  useEffect(() => {
    const errorType = searchParams.get('error');
    if (errorType === 'blocked') {
      toast.error('Your account has been blocked. Please contact admin.');
      // Clean up URL
      router.replace('/login');
    } else if (errorType === 'session_expired') {
      toast.error('Session expired. Please log in again.');
      router.replace('/login');
    }
  }, [searchParams, router]);

  // Pre-select role from query param
  useEffect(() => {
    const roleParam = searchParams.get('role') as UserRole;
    const validRoles: UserRole[] = ['student', 'hr', 'interviewer', 'college_admin'];
    
    if (roleParam && validRoles.includes(roleParam)) {
      setActiveRole(roleParam);
    }
  }, [searchParams]);

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
      const { user, isFirstLogin } = await loginUser(activeRole, { email, password });
      
      // Update Redux state
      dispatch(setAuth({ role: user.role }));
      
      // Populate role-specific slice
      switch (user.role) {
        case 'student':
          dispatch(setStudentDetails(user));
          break;
        case 'college_admin':
          dispatch(setCollegeAdminDetails(user));
          break;
        case 'hr':
          dispatch(setHRDetails(user));
          break;
        case 'interviewer':
          dispatch(setInterviewerDetails(user));
          break;
        case 'super_admin':
          dispatch(setSuperAdminDetails(user));
          break;
      }

      toast.success(`Welcome back, ${user.firstName}!`);
      
      const getStudentRedirect = () => {
        if (isFirstLogin) return '/student/setup';
        if (user.status === 'PENDING_VERIFICATION' || user.status === 'REJECTED') return '/student/verify';
        return '/student';
      };

      const getCollegeRedirect = () => {
        return '/college';
      };

      const getHRRedirect = () => {
        return '/hr';
      };

      const roleRedirects: Record<UserRole, string> = {
        student: getStudentRedirect(),
        hr: getHRRedirect(),
        college_admin: getCollegeRedirect(),
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

  const content = roleContent[activeRole];

  return (
    <div className="min-h-screen w-full flex bg-white font-sans text-slate-900">
      {/* Split Screen Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 w-full min-h-screen">
        
        {/* Left Side: Dynamic Branding Content */}
        <div className="hidden lg:flex flex-col bg-slate-50 relative p-16 xl:p-24 overflow-hidden border-r border-slate-100">
          {/* Background Gradient */}
          <div className="absolute inset-0 z-0">
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(99,102,241,0.06),transparent_60%),radial-gradient(circle_at_70%_70%,rgba(139,92,246,0.04),transparent_60%)]" />
          </div>

          {/* Logo */}
          <div className="relative z-10 mb-auto">
            <Link href="/" className="flex items-center gap-3 text-2xl font-black group">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 shadow-lg shadow-indigo-500/30 flex items-center justify-center text-white">CH</div>
              <span className="tracking-tighter">CareerHub</span>
            </Link>
          </div>

          {/* Dynamic Content */}
          <div className="relative z-10 max-w-lg">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeRole}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100/50 text-indigo-700 text-[10px] font-black uppercase tracking-widest mb-8">
                  Enterprise Solution
                </div>
                <h1 className="text-6xl xl:text-7xl font-black leading-tight mb-8 tracking-tighter">
                  {content.title}
                </h1>
                <p className="text-xl text-slate-500 leading-relaxed font-medium mb-12">
                  {content.subtitle}
                </p>

                {/* Testimonial Card */}
                <div className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.05)] relative">
                  <div className="absolute -top-4 -left-4 w-10 h-10 bg-indigo-600 text-white flex items-center justify-center rounded-xl font-serif text-3xl italic shadow-lg shadow-indigo-500/20">"</div>
                  <p className="text-lg font-medium text-slate-700 italic mb-8 leading-relaxed">
                    {content.quote}
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-100 overflow-hidden ring-4 ring-slate-50 shrink-0">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${content.author}`} alt={content.author} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-900 truncate">{content.author}</h4>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest truncate">{content.position}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-auto relative z-10 pt-12">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">© 2026 CareerHub Inc.</p>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="flex items-center justify-center p-8 lg:p-16 xl:p-24 relative bg-white">
          {/* Mobile Logo */}
          <div className="absolute top-8 left-8 lg:hidden">
            <Link href="/" className="flex items-center gap-2 text-2xl font-black">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg" />
              <span className="tracking-tighter">CH</span>
            </Link>
          </div>

          <div className="w-full max-w-md">
            <div className="text-center lg:text-left mb-12">
               <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-8 mx-auto lg:mx-0 shadow-sm border border-indigo-100/30">
                  {React.createElement(roles.find(r => r.id === activeRole)!.icon, { size: 32, strokeWidth: 2.5 })}
               </div>
               <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter leading-none">Welcome back</h2>
               <p className="text-slate-500 font-medium text-lg leading-relaxed">Log in to manage your enterprise placements.</p>
            </div>

            {/* Role Switcher Tabs */}
            <div className="flex bg-slate-50 p-1.5 rounded-2xl mb-10 gap-1 border border-slate-100">
              {roles.map(role => (
                <button
                  key={role.id}
                  onClick={() => setActiveRole(role.id)}
                  className={`
                    flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300
                    ${activeRole === role.id ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200/50' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100/50'}
                  `}
                >
                  {role.label}
                </button>
              ))}
            </div>

            <form noValidate onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                <Input 
                  type="email" 
                  icon={<Mail size={20} className="text-slate-400" />} 
                  placeholder="name@company.com"
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
                className="h-16 mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-2xl shadow-indigo-500/30 active:scale-[0.98] transition-all border-none"
              >
                Sign In to Portal
              </Button>
            </form>

            <div className="mt-12 pt-8 border-t border-slate-50 text-center lg:text-left">
              <p className="text-sm font-medium text-slate-400">
                Don't have an account? <Link href="/register-selection" className="text-indigo-600 font-black hover:text-indigo-700 transition-colors ml-1">Create Account</Link>
              </p>
              {/* {activeRole === 'student' && (
                <p className="text-sm font-medium text-slate-400 mt-2">
                  Didn't receive invitation? <Link href="/student/request-access" className="text-indigo-600 font-black hover:text-indigo-700 transition-colors ml-1">Request Access</Link>
                </p>
              )} */}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
