'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  GraduationCap,
  Mail,
  User,
  Briefcase,
  ChevronLeft,
  CheckCircle2,
  Phone,
  FileText,
  Building
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/shared/Button';
import { Input } from '@/components/shared/Input';
import { OrganizationService } from '@/services/organization/organization.service';
import { apiClient } from '@/services/api/api.client';
import { toast } from 'sonner';
import { studentRequestAccessSchema } from '@/utils/validation';
import { z } from 'zod';

export default function RequestAccessPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    rollNumber: '',
    department: '',
    phoneNumber: '',
    collegeId: '',
  });

  const [colleges, setColleges] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const data = await OrganizationService.getOrganizations();
        setColleges(data);
      } catch (err) {
        console.error('Failed to fetch colleges', err);
      }
    };
    fetchColleges();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      studentRequestAccessSchema.parse(formData);
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
      await apiClient.post('/auth/student/request-access', formData);
      setIsSuccess(true);
      toast.success('Request submitted successfully!');
    } catch (err: type) {
      // toast handled by interceptor
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-12 text-center"
        >
          <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mb-8 mx-auto shadow-sm">
            <CheckCircle2 size={40} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-4 tracking-tighter">Request Received</h1>
          <p className="text-slate-500 font-medium mb-8 leading-relaxed">
            Your request for access has been sent to your college admin. Once approved, you will receive an invitation link at <span className="text-slate-900 font-bold">{formData.email}</span>.
          </p>
          <Button
            fullWidth
            onClick={() => router.push('/login?role=student')}
            className="h-14 bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest text-xs rounded-2xl transition-all"
          >
            Back to Login
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100">

        {/* Left Side: Info */}
        <div className="bg-indigo-600 p-12 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Background circles */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/20 rounded-full -ml-32 -mb-32 blur-3xl" />

          <div className="relative z-10">
            <Link href="/login?role=student" className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-12 group">
              <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-xs font-black uppercase tracking-widest">Back to Login</span>
            </Link>

            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-sm border border-white/20">
              <GraduationCap size={32} />
            </div>

            <h1 className="text-4xl font-black mb-6 tracking-tighter leading-tight">Didn't get an invitation?</h1>
            <p className="text-indigo-100 font-medium text-lg leading-relaxed mb-8">
              If your college is on CareerHub but you haven't received your invite link, you can request access here.
            </p>

            <ul className="space-y-4">
              {[
                "Verification by college admin",
                "Secure onboarding flow",
                "Access to placement portal",
                "Direct employer connections"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-sm font-bold text-white/90">
                  <CheckCircle2 size={18} className="text-indigo-300" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative z-10 pt-12 border-t border-white/10 mt-12">
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300">CareerHub Enterprise</p>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="p-12 lg:p-16">
          <form noValidate onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">First Name</label>
                <Input
                  icon={<User size={18} className="text-slate-400" />}
                  placeholder="John"
                  required
                  value={formData.firstName}
                  onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                  error={errors.firstName}
                  className="h-12 bg-slate-50 border-slate-100 rounded-xl focus:bg-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Last Name</label>
                <Input
                  icon={<User size={18} className="text-slate-400" />}
                  placeholder="Doe"
                  required
                  value={formData.lastName}
                  onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                  error={errors.lastName}
                  className="h-12 bg-slate-50 border-slate-100 rounded-xl focus:bg-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">College Email</label>
              <Input
                type="email"
                icon={<Mail size={18} className="text-slate-400" />}
                placeholder="john.doe@college.edu"
                required
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                error={errors.email}
                className="h-12 bg-slate-50 border-slate-100 rounded-xl focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Roll Number</label>
                <Input
                  icon={<FileText size={18} className="text-slate-400" />}
                  placeholder="2021CS01"
                  required
                  value={formData.rollNumber}
                  onChange={e => setFormData({ ...formData, rollNumber: e.target.value })}
                  error={errors.rollNumber}
                  className="h-12 bg-slate-50 border-slate-100 rounded-xl focus:bg-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Department</label>
                <Input
                  icon={<Briefcase size={18} className="text-slate-400" />}
                  placeholder="CSE"
                  required
                  value={formData.department}
                  onChange={e => setFormData({ ...formData, department: e.target.value })}
                  error={errors.department}
                  className="h-12 bg-slate-50 border-slate-100 rounded-xl focus:bg-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Phone Number</label>
              <Input
                type="tel"
                icon={<Phone size={18} className="text-slate-400" />}
                placeholder="+91 98765 43210"
                required
                value={formData.phoneNumber}
                onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
                error={errors.phoneNumber}
                className="h-12 bg-slate-50 border-slate-100 rounded-xl focus:bg-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Select Institution</label>
              <div className="relative">
                <Building size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  required
                  value={formData.collegeId}
                  onChange={e => setFormData({ ...formData, collegeId: e.target.value })}
                  className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-12 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none"
                >
                  <option value="">Choose your college...</option>
                  {colleges.map(college => (
                    <option key={college.id} value={college.id}>{college.name}</option>
                  ))}
                </select>
                {errors.collegeId && <p className="text-rose-500 text-xs font-bold mt-1.5 ml-1">{errors.collegeId}</p>}
              </div>
            </div>

            <Button
              type="submit"
              fullWidth
              isLoading={isLoading}
              className="h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-indigo-500/20 mt-4 active:scale-[0.98] transition-all border-none"
            >
              Submit Request
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
