'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Building2, Mail, Lock, User, ArrowRight, ChevronLeft } from 'lucide-react';
import { GlassCard } from '@/components/shared/GlassCard';
import { Button } from '@/components/shared/Button';
import { Input } from '@/components/shared/Input';
import { useRouter } from 'next/navigation';
import { registerHR, verifyHROtp } from '@/services/auth/auth.service';
import { toast } from 'sonner';
import { useAppDispatch } from '@/redux/hooks';
import { setAuth } from '@/redux/slices/authSlice';
import { setHRDetails } from '@/redux/slices/hrSlice';
import { hrRegisterSchema } from '@/utils/validation';
import { z } from 'zod';
import { OtpInput } from '@/components/shared/OtpInput';

export default function HRRegistrationPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    jobTitle: ''
  });
  
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setErrors({});
    
    // Validate
    try {
      // For registration, we might need a slightly different schema if the UI fields don't match 1:1, 
      // but let's assume they match or adjust.
      hrRegisterSchema.parse(formData); 
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
      const result = await registerHR(formData);
      
      if (result.requiresOtp) {
        setRegisteredEmail(result.email || formData.email);
        setShowOtp(true);
        toast.success(result.message || 'OTP sent to your email.');
      }
    } catch {
      // Handled by interceptor
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { user } = await verifyHROtp({ email: registeredEmail, otp });
      dispatch(setAuth({ role: 'hr' }));
      dispatch(setHRDetails(user));
      toast.success('Company verified successfully!');
      router.push('/hr/onboarding'); 
    } catch {
      // Handled by interceptor
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.05),transparent)]">
      <Link href="/register-selection" className="absolute top-8 left-8 flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors">
        <ChevronLeft size={16} /> Back to selection
      </Link>

      <GlassCard className="max-w-[550px] w-full p-10">
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-6 shadow-sm">
            <Building2 size={28} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">
            {showOtp ? 'Verify Your Email' : 'Create Company Account'}
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            {showOtp ? `We've sent a 6-digit code to ${registeredEmail}` : 'Start hiring top talent for your organization.'}
          </p>
        </div>

        {!showOtp ? (
          <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="First Name" 
              icon={<User size={18} />} 
              placeholder="John" 
              value={formData.firstName} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e, 'firstName')} 
              error={errors.firstName}
              required 
            />
            <Input 
              label="Last Name" 
              icon={<User size={18} />} 
              placeholder="Doe" 
              value={formData.lastName} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e, 'lastName')} 
              error={errors.lastName}
              required 
            />
          </div>
          <Input 
            label="Work Email" 
            type="email" 
            icon={<Mail size={18} />} 
            placeholder="hr@company.com" 
            value={formData.email} 
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e, 'email')} 
            error={errors.email}
            required 
          />
          <Input 
            label="Password" 
            type="password" 
            icon={<Lock size={18} />} 
            placeholder="Create a strong password" 
            value={formData.password} 
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e, 'password')} 
            error={errors.password}
            required 
          />
          <Input 
            label="Job Title" 
            icon={<Building2 size={18} />} 
            placeholder="e.g. HR Manager" 
            value={formData.jobTitle} 
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e, 'jobTitle')} 
            error={errors.jobTitle}
            required 
          />
          <Button 
            type="submit" 
            fullWidth 
            isLoading={isLoading} 
            className="mt-4 bg-indigo-600 hover:bg-indigo-700 font-bold"
          >
            Create Account <ArrowRight size={18} className="ml-2" />
          </Button>
        </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="flex flex-col gap-8">
            <OtpInput 
              value={otp}
              onChange={setOtp}
              onResend={() => handleSubmit()}
              isLoading={isLoading}
            />
            <Button 
              type="submit" 
              fullWidth 
              isLoading={isLoading} 
              className="bg-indigo-600 hover:bg-indigo-700 font-bold h-14 rounded-2xl"
            >
              Verify & Continue
            </Button>
          </form>
        )}

        {!showOtp && (
          <p className="text-center mt-10 text-sm font-medium text-slate-400">
            Already have an account? <Link href="/login" className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors">Sign in</Link>
          </p>
        )}
      </GlassCard>
    </div>
  );
}
