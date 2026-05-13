'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Building2, MapPin, Phone, Mail, 
  ArrowRight, ArrowLeft, Globe, 
  X, Upload, Check, Star, Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/shared/Button';
import { Input } from '@/components/shared/Input';
import { updateHROnboarding } from '@/services/auth/auth.service';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setHRDetails } from '@/redux/slices/hrSlice';

const step1Schema = z.object({
  name: z.string().min(3, 'Company name must be at least 3 characters'),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  industry: z.string().min(1, 'Industry is required'),
  headquarters: z.string().optional(),
  description: z.string().optional(),
});

const step2Schema = z.object({
  size: z.string().min(1, 'Company size is required'),
  industry: z.string().min(1, 'Industry is required'),
});

const step3Schema = z.object({
  contactName: z.string().min(3, 'Contact name is required'),
  jobTitle: z.string().optional(),
  contactEmail: z.string().email('Invalid email address'),
  contactPhone: z.string().optional(),
  preferredColleges: z.array(z.string()).optional(),
  logoUrl: z.string().optional(),
});

const steps = [
  { id: 'company', title: 'Company Details', description: 'Company Details' },
  { id: 'team', title: 'Team & Hiring', description: 'Team & Hiring Preferences' },
  { id: 'final', title: 'Logo & Preferences', description: 'Logo & Preferences' }
];

const industries = [
  "Information Technology", 
  "Software Development", 
  "Cloud Computing", 
  "Artificial Intelligence", 
  "Cybersecurity", 
  "Data Science", 
  "E-commerce", 
  "Product-based IT",
  "Other IT Services"
];

const companySizes = ["1-50", "51-200", "201-500", "501-1000", "1000+"];

interface HRFormValues {
  name: string;
  website: string;
  industry: string;
  headquarters: string;
  description: string;
  size: string;
  contactName: string;
  jobTitle: string;
  contactEmail: string;
  contactPhone: string;
  preferredColleges: string[];
  logoUrl: string;
}

export default function HROnboardingPage() {
  const dispatch = useAppDispatch();
  const hrDetails = useAppSelector((state) => state.hr.details);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    if (hrDetails?.onboardingStep) {
      setCurrentStep(Math.min(hrDetails.onboardingStep + 1, steps.length));
    }
  }, [hrDetails]);

  const [isLoading, setIsLoading] = useState(false);
  const [collegeInput, setCollegeInput] = useState('');
  const router = useRouter();

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<HRFormValues>({
    resolver: zodResolver(
      currentStep === 1 ? step1Schema : 
      currentStep === 2 ? step2Schema : 
      step3Schema
    ) as any,
    defaultValues: {
      name: '',
      website: '',
      industry: '',
      headquarters: '',
      description: '',
      size: '',
      contactName: '',
      jobTitle: '',
      contactEmail: '',
      contactPhone: '',
      preferredColleges: [] as string[],
      logoUrl: ''
    }
  });

  const preferredColleges = watch('preferredColleges') || [];
  const size = watch('size');
  const industry = watch('industry');

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, steps.length));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const addCollege = () => {
    if (collegeInput.trim() && !preferredColleges.includes(collegeInput.trim())) {
      setValue('preferredColleges', [...preferredColleges, collegeInput.trim()], { shouldValidate: true });
      setCollegeInput('');
    }
  };

  const removeCollege = (college: string) => {
    setValue('preferredColleges', preferredColleges.filter(c => c !== college), { shouldValidate: true });
  };

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const updatedCompany = await updateHROnboarding({ ...data, step: currentStep });
      
      // Update Redux state with new onboarding step and company info
      if (hrDetails) {
        dispatch(setHRDetails({
          ...hrDetails,
          companyName: updatedCompany.name,
          onboardingStep: updatedCompany.onboardingStep,
          industry: updatedCompany.industry,
          status: updatedCompany.status || hrDetails.status
        }));
      }

      if (currentStep < steps.length) {
        nextStep();
      } else {
        toast.success('Onboarding completed successfully!');
        router.push('/hr');
      }
    } catch (error) {
      toast.error('Failed to update onboarding.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen h-screen flex items-center justify-center p-4 sm:p-6 bg-slate-50 relative overflow-hidden">
      {/* Matched Blurred Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-100 rounded-full blur-[120px] opacity-60" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-100 rounded-full blur-[120px] opacity-60" />
         <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-indigo-50 rounded-full blur-[120px] opacity-40" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-4xl z-10 max-h-[95vh] flex flex-col"
      >
        <div className="bg-white rounded-[32px] shadow-2xl shadow-indigo-900/10 overflow-hidden border border-slate-200 flex flex-col h-full">
          {/* Header with Purple Gradient */}
          <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 p-6 sm:px-10 sm:py-7 text-white relative flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
               <div className="flex items-center gap-2">
                 <div className="w-7 h-7 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center">
                   <Building2 size={16} className="text-white" />
                 </div>
                 <span className="font-bold tracking-tight text-lg">creerHub</span>
               </div>
               {/* Progress Bars */}
               <div className="flex gap-2 w-32">
                 {steps.map((s, i) => (
                   <div key={s.id} className={`h-1 flex-1 rounded-full transition-all duration-500 ${i + 1 <= currentStep ? 'bg-white' : 'bg-white/30'}`} />
                 ))}
               </div>
            </div>

            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h1 className="text-xl sm:text-2xl font-bold mb-0.5">
                {currentStep === 1 && "Welcome! Set up your company profile"}
                {currentStep === 2 && "Tell us about your team"}
                {currentStep === 3 && "Final touches — almost there!"}
              </h1>
              <p className="text-white/60 text-xs font-medium uppercase tracking-wider">
                Step {currentStep} of 3 — {steps[currentStep-1].description}
              </p>
            </motion.div>
          </div>

          {/* Form Content - Scrollable */}
          <div className="overflow-y-auto flex-1 p-6 sm:p-10 custom-scrollbar">
            <form onSubmit={handleSubmit(onSubmit)} className="h-full flex flex-col">
              <AnimatePresence mode="wait">
                {currentStep === 1 && (
                  <motion.div 
                    key="step1"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <Input 
                        label="Company Name" 
                        placeholder="e.g. Google Inc."
                        {...register('name')}
                        error={errors.name?.message as string}
                        className="bg-slate-50/50 h-12"
                      />
                      <Input 
                        label="Website (Optional)" 
                        placeholder="https://company.com"
                        icon={<Globe size={16} />}
                        {...register('website')}
                        error={errors.website?.message as string}
                        className="bg-slate-50/50 h-12"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 ml-1">Industry</label>
                        <select 
                          className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 h-12 text-sm font-medium appearance-none cursor-pointer outline-none focus:border-indigo-500"
                          {...register('industry')}
                        >
                          <option value="">Select Industry</option>
                          {industries.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                        </select>
                        {errors.industry && <p className="text-[10px] text-rose-500 font-bold ml-1">{errors.industry.message as string}</p>}
                      </div>
                      <Input 
                        label="Headquarters (Optional)" 
                        placeholder="e.g. Bangalore, India"
                        icon={<MapPin size={16} />}
                        {...register('headquarters')}
                        className="bg-slate-50/50 h-12"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 ml-1">Company Description (Optional)</label>
                      <textarea 
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-medium min-h-[120px] resize-none"
                        placeholder="Brief description about your company..."
                        {...register('description')}
                      />
                    </div>
                  </motion.div>
                )}

                {currentStep === 2 && (
                  <motion.div 
                    key="step2"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-8"
                  >
                    <div className="space-y-4">
                      <label className="text-sm font-bold text-slate-700 ml-1">Company Size</label>
                      <div className="flex flex-wrap gap-3">
                        {companySizes.map(s => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setValue('size', s, { shouldValidate: true })}
                            className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 border ${
                              size === s 
                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105' 
                                : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-400 hover:text-indigo-600'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                      {errors.size && <p className="text-[10px] text-rose-500 font-bold ml-1">{errors.size.message as string}</p>}
                    </div>

                    <div className="space-y-4">
                      <label className="text-sm font-bold text-slate-700 ml-1">Industry Confirmation</label>
                      <select 
                        className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 h-12 text-sm font-medium appearance-none cursor-pointer outline-none focus:border-indigo-500"
                        {...register('industry')}
                      >
                        <option value="">Select your industry...</option>
                        {industries.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                      </select>
                      {errors.industry && <p className="text-[10px] text-rose-500 font-bold ml-1">{errors.industry.message as string}</p>}
                    </div>
                  </motion.div>
                )}

                {currentStep === 3 && (
                  <motion.div 
                    key="step3"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-6"
                  >
                    <div className="flex flex-col lg:flex-row gap-8">
                      <div className="flex-1 space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <Input 
                            label="Contact Name" 
                            placeholder="e.g. Priya Sharma"
                            {...register('contactName')}
                            error={errors.contactName?.message as string}
                            className="bg-slate-50/50 h-11"
                          />
                          <Input 
                            label="Job Title (Optional)" 
                            placeholder="e.g. HR Manager"
                            {...register('jobTitle')}
                            className="bg-slate-50/50 h-11"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <Input 
                            label="Contact Email" 
                            placeholder="hr@company.com"
                            icon={<Mail size={16} />}
                            {...register('contactEmail')}
                            error={errors.contactEmail?.message as string}
                            className="bg-slate-50/50 h-11"
                          />
                          <Input 
                            label="Phone Number (Optional)" 
                            placeholder="+91 98765 43210"
                            icon={<Phone size={16} />}
                            {...register('contactPhone')}
                            className="bg-slate-50/50 h-11"
                          />
                        </div>

                        <div className="space-y-3">
                          <label className="text-sm font-bold text-slate-800 ml-1">Preferred Colleges (Optional)</label>
                          <div className="flex gap-2">
                            <div className="flex-1">
                              <Input 
                                placeholder="Type college name and add..."
                                value={collegeInput}
                                onChange={(e: any) => setCollegeInput(e.target.value)}
                                onKeyDown={(e: any) => e.key === 'Enter' && (e.preventDefault(), addCollege())}
                                className="bg-slate-50/50 h-11"
                              />
                            </div>
                            <Button type="button" onClick={addCollege} className="h-11 px-4 bg-indigo-50 text-indigo-600 border-none hover:bg-indigo-100 font-bold transition-all">
                              + Add
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {preferredColleges.map(college => (
                              <span key={college} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-full text-xs font-bold">
                                {college}
                                <button type="button" onClick={() => removeCollege(college)} className="text-slate-400 hover:text-rose-500 transition-colors">
                                  <X size={14} />
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="lg:w-64 space-y-4">
                        <label className="text-sm font-bold text-slate-800 ml-1">Company Logo</label>
                        <div className="aspect-square w-full rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center p-6 text-center group hover:border-indigo-400 hover:bg-indigo-50/30 transition-all cursor-pointer">
                          <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <Upload size={24} />
                          </div>
                          <p className="text-[11px] font-bold text-slate-600 mb-1">
                            Drag & drop or <span className="text-indigo-600">browse to upload</span>
                          </p>
                          <p className="text-[10px] text-slate-400 font-medium">PNG, JPG up to 2MB</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between pt-6 mt-10 border-t border-slate-100">
                <div className="flex items-center">
                  {currentStep > 1 && (
                    <button 
                      type="button" 
                      onClick={prevStep} 
                      className="flex items-center gap-2 text-sm font-black text-slate-400 hover:text-slate-900 transition-all"
                    >
                      <ArrowLeft size={16} /> Back
                    </button>
                  )}
                </div>
                
                <Button 
                  type="submit" 
                  isLoading={isLoading}
                  className="px-10 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black shadow-xl shadow-indigo-200/50 hover:shadow-indigo-300/50 hover:scale-[1.02] transition-all flex items-center gap-2 border-none"
                >
                  {currentStep === steps.length ? "🚀 Complete Setup" : "Continue"} <ArrowRight size={18} />
                </Button>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
