'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { GraduationCap, Mail, Lock, User, MapPin, ChevronLeft, ArrowRight } from 'lucide-react';
import { GlassCard } from '@/components/shared/GlassCard';
import { Button } from '@/components/shared/Button';
import { Input } from '@/components/shared/Input';
import { useRouter } from 'next/navigation';
import { registerCollege } from '@/services/auth/auth.service';
import { toast } from 'sonner';

export default function CollegeRegistrationPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    organizationName: '',
    city: '',
    state: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, field: string) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await registerCollege(formData);
      toast.success('Registration successful! Please check your email for verification.');
      router.push('/login');
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
          <h1 className="text-3xl font-black text-slate-900 mb-2">Institution Registration</h1>
          <p className="text-slate-500 text-sm font-medium">Partner with top companies to place your students.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Admin First Name" 
              icon={<User size={18} />} 
              placeholder="Jane" 
              value={formData.firstName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e, 'firstName')}
              required 
            />
            <Input 
              label="Admin Last Name" 
              icon={<User size={18} />} 
              placeholder="Smith" 
              value={formData.lastName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e, 'lastName')}
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
              required 
            />
            <Input 
              label="Password" 
              type="password" 
              icon={<Lock size={18} />} 
              placeholder="Secure password" 
              value={formData.password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e, 'password')}
              required 
            />
          </div>

          <Input 
            label="Institution Name" 
            icon={<GraduationCap size={18} />} 
            placeholder="e.g. Stanford University" 
            value={formData.organizationName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e, 'organizationName')}
            required 
          />

          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="City" 
              icon={<MapPin size={18} />} 
              placeholder="City" 
              value={formData.city}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e, 'city')}
              required 
            />
            <Input 
              label="State" 
              icon={<MapPin size={18} />} 
              placeholder="State" 
              value={formData.state}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e, 'state')}
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
            Register Institution <ArrowRight size={18} />
          </Button>
        </form>

        <p className="text-center mt-10 text-sm font-medium text-slate-400">
          Already registered? <Link href="/login" className="text-emerald-600 font-bold hover:text-emerald-700 transition-colors">Sign in</Link>
        </p>
      </GlassCard>
    </div>
  );
}
