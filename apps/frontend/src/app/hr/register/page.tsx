'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Building2, Mail, Lock, User, ArrowRight, ChevronLeft } from 'lucide-react';
import { GlassCard } from '@/components/shared/GlassCard';
import { Button } from '@/components/shared/Button';
import { Input } from '@/components/shared/Input';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { registerHR } from '@/services/auth/auth.service';
import { toast } from 'sonner';

export default function HRRegistrationPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    companyName: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { user } = await registerHR(formData);
      login(user);
      toast.success('Company registered! Complete your profile.');
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
          <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-6 shadow-sm">
            <Building2 size={28} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">Create Company Account</h1>
          <p className="text-slate-500 text-sm font-medium">Start hiring top talent for your organization.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="First Name" 
              icon={<User size={18} />} 
              placeholder="John" 
              value={formData.firstName} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e, 'firstName')} 
              required 
            />
            <Input 
              label="Last Name" 
              icon={<User size={18} />} 
              placeholder="Doe" 
              value={formData.lastName} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e, 'lastName')} 
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
            required 
          />
          <Input 
            label="Password" 
            type="password" 
            icon={<Lock size={18} />} 
            placeholder="Create a strong password" 
            value={formData.password} 
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e, 'password')} 
            required 
          />
          <Input 
            label="Company Name" 
            icon={<Building2 size={18} />} 
            placeholder="e.g. Acme Corp" 
            value={formData.companyName} 
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e, 'companyName')} 
            required 
          />
          <Button 
            type="submit" 
            roleType="hr" 
            fullWidth 
            isLoading={isLoading} 
            className="mt-4 bg-purple-600 hover:bg-purple-700"
          >
            Continue to Setup <ArrowRight size={18} />
          </Button>
        </form>

        <p className="text-center mt-10 text-sm font-medium text-slate-400">
          Already have an account? <Link href="/login" className="text-purple-600 font-bold hover:text-purple-700 transition-colors">Sign in</Link>
        </p>
      </GlassCard>
    </div>
  );
}
