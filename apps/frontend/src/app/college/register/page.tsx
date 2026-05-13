'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { GraduationCap, Mail, Lock, User, MapPin, ChevronLeft, ArrowRight } from 'lucide-react';
import { GlassCard } from '@/components/shared/GlassCard';
import { Button } from '@/components/shared/Button';
import { Input } from '@/components/shared/Input';
import { useRouter } from 'next/navigation';
import { registerCollege, verifyCollegeOtp } from '@/services/auth/auth.service';
import { toast } from 'sonner';
import { useAppDispatch } from '@/redux/hooks';
import { setAuth } from '@/redux/slices/authSlice';
import { setCollegeAdminDetails } from '@/redux/slices/collegeAdminSlice';
import { collegeRegisterSchema } from '@/utils/validation';
import { z } from 'zod';
import { OtpInput } from '@/components/shared/OtpInput';

export default function CollegeRegistrationPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });

  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, field: string) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setErrors({});
    
    try {
      collegeRegisterSchema.parse(formData);
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
      const result = await registerCollege(formData);
      
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
      const { user } = await verifyCollegeOtp({ email: registeredEmail, otp });
      dispatch(setAuth({ role: 'college_admin' }));
      dispatch(setCollegeAdminDetails(user));
      toast.success('Institution verified successfully!');
      router.push('/college/onboarding'); // Redirect to onboarding
    } catch {
      // Handled by interceptor
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.05),transparent)]">
      <Link href="/register-selection" className="absolute top-8 left-8 flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors">
        <ChevronLeft size={16} /> Back to selection
      </Link>

      <GlassCard className="max-w-[650px] w-full p-10">
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-sm">
            <GraduationCap size={28} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">
            {showOtp ? 'Verify Your Email' : 'Institution Registration'}
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            {showOtp ? `We've sent a 6-digit code to ${registeredEmail}` : 'Partner with top companies to place your students.'}
          </p>
        </div>

        {!showOtp ? (
          <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-4">
              <Input 
                label="Admin First Name" 
                icon={<User size={18} />} 
                placeholder="Jane" 
                value={formData.firstName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e, 'firstName')}
                error={errors.firstName}
                required 
              />
              <Input 
                label="Admin Last Name" 
                icon={<User size={18} />} 
                placeholder="Smith" 
                value={formData.lastName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e, 'lastName')}
                error={errors.lastName}
                required 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Input 
                label="Institutional Email" 
                type="email" 
                icon={<Mail size={18} />} 
                placeholder="admin@university.edu" 
                value={formData.email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e, 'email')}
                error={errors.email}
                required 
              />
              <Input 
                label="Password" 
                type="password" 
                icon={<Lock size={18} />} 
                placeholder="Secure password" 
                value={formData.password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e, 'password')}
                error={errors.password}
                required 
              />
            </div>

            <Button 
              type="submit" 
              roleType="organizer" 
              fullWidth 
              isLoading={isLoading}
              className="mt-4 bg-emerald-600 hover:bg-emerald-700"
            >
              Register Institution <ArrowRight size={18} className="ml-2" />
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
              roleType="organizer"
              fullWidth 
              isLoading={isLoading} 
              className="bg-emerald-600 hover:bg-emerald-700 font-bold h-14 rounded-2xl"
            >
              Verify & Continue
            </Button>
          </form>
        )}

        {!showOtp && (
          <p className="text-center mt-10 text-sm font-medium text-slate-400">
            Already registered? <Link href="/login" className="text-emerald-600 font-bold hover:text-emerald-700 transition-colors">Sign in</Link>
          </p>
        )}
      </GlassCard>
    </div>
  );
}
