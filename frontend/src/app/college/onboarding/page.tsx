'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  GraduationCap, MapPin, Globe,
  ArrowRight, ArrowLeft, Building2,
  Users, BarChart3, Link as LinkIcon,
  CheckCircle2, X, Upload, Check, Star,
  Mail, Phone, Search, AlertTriangle, Send,
  FileText, Trash2, Download, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/shared/Button';
import { Input } from '@/components/shared/Input';
import { updateCollegeOnboarding, logoutUser } from '@/services/auth/auth.service';
import { apiClient } from '@/services/api/api.client';
import { PLATFORM_BRANCHES } from '@/constants/academic';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setCollegeAdminDetails, clearCollegeAdminDetails } from '@/redux/slices/collegeAdminSlice';
import { VerificationDocumentItem } from '@/redux/slices/hrSlice';
import { clearAuth } from '@/redux/slices/authSlice';

export const COLLEGE_VERIFICATION_CATEGORIES = [
  { value: 'ESTABLISHMENT_CERTIFICATE', label: 'Institution Registration / Establishment Certificate' },
  { value: 'GOVERNMENT_RECOGNITION', label: 'Government Recognition / Affiliation Certificate' },
  { value: 'UGC_AICTE_AFFILIATION', label: 'UGC / AICTE / University Affiliation Proof' },
  { value: 'INSTITUTION_AUTHORIZATION', label: 'Official Institutional Authorization Letter' },
  { value: 'OTHER', label: 'Other Official Institution Verification Document' },
] as const;

const step1Schema = z.object({
  name: z.string()
    .trim()
    .min(3, 'Official institution name must be at least 3 characters')
    .max(150, 'Institution name cannot exceed 150 characters')
    .refine((val) => !/^Pending Institution/i.test(val.trim()), {
      message: 'Please enter your actual official institution name, not a placeholder',
    }),
  shortName: z.string().optional(),
  yearEstablished: z.string().optional(),
  website: z.string().optional().or(z.literal('')),
  address: z.string().optional(),
  city: z.string().min(2, 'City must be at least 2 characters'),
  state: z.string().min(2, 'State must be at least 2 characters'),
  naacGrade: z.string().optional(),
  logoUrl: z.string().optional(),
});

const step2Schema = z.object({
  activeBranches: z.array(z.string()).optional(),
  currentAcademicYear: z.string().optional(),
  activePlacementBatch: z.string().optional(),
});

const step3Schema = z.object({
  plan: z.enum(['basic', 'pro']).optional().default('pro'),
});

const steps = [
  { id: 'institution', title: 'Institution Setup', description: 'Institution Setup' },
  { id: 'departments', title: 'Departments & Branches', description: 'Departments & Branches' },
  { id: 'plan', title: 'Plan & Resubmit', description: 'Plan and review' },
  { id: 'complete', title: 'All Set!', description: 'All Set!' }
];

interface CollegeFormValues {
  name: string;
  shortName: string;
  yearEstablished: string;
  website: string;
  address: string;
  city: string;
  state: string;
  naacGrade: string;
  activeBranches: string[];
  currentAcademicYear: string;
  activePlacementBatch: string;
  plan: 'basic' | 'pro';
  logoUrl: string;
}

export default function CollegeOnboardingPage() {
  const dispatch = useAppDispatch();
  const collegeAdminDetails = useAppSelector((state) => state.collegeAdmin.details);
  const isRejected = collegeAdminDetails?.status?.toUpperCase() === 'REJECTED';
  const [currentStep, setCurrentStep] = useState(1);
  const hasInitializedRef = useRef(false);

  const [isLoading, setIsLoading] = useState(false);
  const [branchInput, setBranchInput] = useState('');
  const [customBranch, setCustomBranch] = useState('');
  const [verificationDocuments, setVerificationDocuments] = useState<VerificationDocumentItem[]>([]);
  const [selectedDocCategory, setSelectedDocCategory] = useState<string>('ESTABLISHMENT_CERTIFICATE');
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const { register, handleSubmit, formState: { errors, isValid }, setValue, watch, getValues } = useForm<CollegeFormValues>({
    shouldUnregister: false,
    resolver: zodResolver(
      currentStep === 1 ? step1Schema :
        currentStep === 2 ? step2Schema :
          step3Schema
    ) as any,
    mode: 'all',
    defaultValues: {
      name: '',
      shortName: '',
      yearEstablished: '',
      website: '',
      address: '',
      city: '',
      state: '',
      naacGrade: '',
      activeBranches: [] as string[],
      currentAcademicYear: '',
      activePlacementBatch: '',
      plan: 'pro' as 'basic' | 'pro',
      logoUrl: ''
    }
  });

  // Prefill existing data and initialize step once
  useEffect(() => {
    if (collegeAdminDetails) {
      if (!hasInitializedRef.current) {
        hasInitializedRef.current = true;
        const requestedStep = searchParams?.get('step');
        if (requestedStep && ['1', '2', '3'].includes(requestedStep)) {
          setCurrentStep(parseInt(requestedStep, 10));
        } else if (isRejected) {
          // When rejected, start at Step 1 so applicant can review and edit
          setCurrentStep(1);
        } else if (collegeAdminDetails.onboardingStep) {
          setCurrentStep(Math.min(collegeAdminDetails.onboardingStep + 1, steps.length));
        }
      }

      const collegeNameVal = collegeAdminDetails.name || collegeAdminDetails.collegeName;
      if (collegeNameVal && !/^Pending Institution/i.test(collegeNameVal.trim())) {
        setValue('name', collegeNameVal, { shouldValidate: true });
      } else {
        setValue('name', '', { shouldValidate: false });
      }
      if (collegeAdminDetails.shortName) setValue('shortName', collegeAdminDetails.shortName);
      if (collegeAdminDetails.yearEstablished) setValue('yearEstablished', collegeAdminDetails.yearEstablished);
      if (collegeAdminDetails.website) setValue('website', collegeAdminDetails.website);
      if (collegeAdminDetails.address) setValue('address', collegeAdminDetails.address);
      if (collegeAdminDetails.city) setValue('city', collegeAdminDetails.city, { shouldValidate: true });
      if (collegeAdminDetails.state) setValue('state', collegeAdminDetails.state, { shouldValidate: true });
      if (collegeAdminDetails.naacGrade) setValue('naacGrade', collegeAdminDetails.naacGrade);
      if (collegeAdminDetails.logoUrl) setValue('logoUrl', collegeAdminDetails.logoUrl);
      if (collegeAdminDetails.activeBranches?.length) setValue('activeBranches', collegeAdminDetails.activeBranches, { shouldValidate: true });
      if (collegeAdminDetails.currentAcademicYear) setValue('currentAcademicYear', collegeAdminDetails.currentAcademicYear);
      if (collegeAdminDetails.activePlacementBatch) setValue('activePlacementBatch', collegeAdminDetails.activePlacementBatch);
      if (collegeAdminDetails.plan) setValue('plan', (collegeAdminDetails.plan as 'basic' | 'pro') || 'pro');

      if (collegeAdminDetails.verificationDocuments && collegeAdminDetails.verificationDocuments.length > 0) {
        setVerificationDocuments(collegeAdminDetails.verificationDocuments);
      } else if (collegeAdminDetails.verificationDocument) {
        setVerificationDocuments([{
          id: 'legacy-doc',
          category: 'OTHER',
          fileName: collegeAdminDetails.verificationDocument.split('/').pop() || 'Verification Document',
          fileUrl: collegeAdminDetails.verificationDocument,
          uploadedAt: new Date()
        }]);
      }
    }
  }, [collegeAdminDetails, isRejected, setValue, searchParams]);

  const activeBranches = watch('activeBranches') || [];
  const plan = watch('plan');

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, steps.length));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleCancelOnboarding = async () => {
    if (isRejected) {
      router.push('/college');
      return;
    }
    setIsLoading(true);
    try {
      await logoutUser();
    } catch { }
    dispatch(clearAuth());
    dispatch(clearCollegeAdminDetails());
    window.location.href = '/college/register';
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('File size must be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setValue('logoUrl', reader.result as string, { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    }
  };

  const addBranch = () => {
    const valueToAdd = branchInput === 'custom' ? customBranch.trim() : branchInput.trim();
    if (valueToAdd && !activeBranches.includes(valueToAdd)) {
      setValue('activeBranches', [...activeBranches, valueToAdd], { shouldValidate: true });
      if (branchInput !== 'custom') setBranchInput('');
      setCustomBranch('');
    }
  };

  const removeBranch = (branchToRemove: string) => {
    setValue('activeBranches', activeBranches.filter(b => b !== branchToRemove), { shouldValidate: true });
  };

  const handleVerificationDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!selectedDocCategory) {
      toast.error('Please select a document category');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only PDF, JPG, PNG, and WEBP files are allowed');
      return;
    }

    setIsUploadingDoc(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', selectedDocCategory);

      const response: any = await apiClient.post('/auth/college-admin/verification-documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const newDoc = response.data?.document;
      if (newDoc) {
        setVerificationDocuments(prev => [...prev.filter(d => d.id !== newDoc.id), newDoc]);
        toast.success('Verification document uploaded successfully');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to upload document';
      toast.error(msg);
    } finally {
      setIsUploadingDoc(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleRemoveVerificationDoc = async (docId: string) => {
    try {
      await apiClient.delete(`/auth/college-admin/verification-documents/${docId}`);
      setVerificationDocuments(prev => prev.filter(d => d.id !== docId));
      toast.success('Document removed');
    } catch (err: any) {
      toast.error('Failed to remove document');
    }
  };

  const onSubmit = async (data: any) => {
    const isFinalStep = currentStep === 3;
    if (isFinalStep) {
      if (verificationDocuments.length === 0) {
        toast.error('Please upload at least one official institution verification document before final submission.');
        return;
      }
    }

    setIsLoading(true);
    try {
      const allFormValues = getValues();
      const payload = {
        ...allFormValues,
        ...data,
        step: currentStep,
        verificationDocuments,
        ...(isFinalStep && isRejected ? { resubmit: true } : {})
      };
      const updatedOrg = await updateCollegeOnboarding(payload) as any;

      if (collegeAdminDetails) {
        dispatch(setCollegeAdminDetails({
          ...collegeAdminDetails,
          ...updatedOrg,
          collegeName: updatedOrg.name,
          name: updatedOrg.name,
          onboardingStep: updatedOrg.onboardingStep,
          activeBranches: updatedOrg.activeBranches || collegeAdminDetails.activeBranches || [],
          verificationDocuments: updatedOrg.verificationDocuments || verificationDocuments,
          verificationDocument: updatedOrg.verificationDocument,
          status: (isFinalStep && isRejected) ? 'PENDING' : (updatedOrg.status || collegeAdminDetails.status),
          rejectionReason: (isFinalStep && isRejected) ? undefined : collegeAdminDetails.rejectionReason
        }));
      }

      if (currentStep < 3) {
        nextStep();
      } else {
        if (isRejected) {
          toast.success('Application resubmitted successfully for review!');
          router.push('/college');
        } else if (currentStep < steps.length) {
          nextStep();
        } else {
          toast.success('Onboarding completed successfully!');
          router.push('/college');
        }
      }
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || 'Failed to update onboarding info.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen h-screen flex items-center justify-center p-4 sm:p-6 bg-slate-50 relative overflow-hidden">
      {/* Matched Blurred Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-100 rounded-full blur-[120px] opacity-60" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-50 rounded-full blur-[120px] opacity-60" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-emerald-50 rounded-full blur-[120px] opacity-40" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-6xl z-10 max-h-[95vh] flex flex-col"
      >
        <div className="bg-white rounded-[32px] shadow-2xl shadow-emerald-900/10 overflow-hidden border border-slate-200 flex flex-col h-full">
          {/* Header with Exact Brand Color Gradient */}
          <div className="bg-gradient-to-br from-[rgb(11,45,31)] via-[#134e35] to-[#1a6646] p-6 sm:px-10 sm:py-7 text-white relative flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center">
                  <GraduationCap size={16} className="text-white" />
                </div>
                <span className="font-bold tracking-tight text-lg">creerHub</span>
              </div>
              {/* Interactive Progress Bars */}
              <div className="flex gap-2 w-36 items-center">
                {[1, 2, 3].map((stepNum) => (
                  <button
                    key={stepNum}
                    type="button"
                    title={`Go to Step ${stepNum}`}
                    onClick={() => setCurrentStep(stepNum)}
                    className={`h-2 flex-1 rounded-full transition-all duration-300 cursor-pointer ${
                      stepNum <= currentStep ? 'bg-white shadow-sm' : 'bg-white/25 hover:bg-white/40'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <h1 className="text-xl sm:text-2xl font-bold mb-0.5">
                  {currentStep === 1 && "Welcome! Set up your institution"}
                  {currentStep === 2 && "Departments & Branches"}
                  {currentStep === 3 && (isRejected ? "Review Application & Resubmit" : "Choose your plan")}
                  {currentStep === 4 && "You're all set!"}
                </h1>
                <p className="text-white/60 text-xs font-medium uppercase tracking-wider">
                  Step {Math.min(currentStep, 3)} of 3 — {steps[Math.min(currentStep, 3) - 1]?.description}
                </p>
              </motion.div>

              {/* Interactive Step Pills */}
              <div className="flex items-center gap-1.5 bg-white/10 p-1 rounded-2xl border border-white/15 backdrop-blur-sm overflow-x-auto">
                {[
                  { num: 1, label: 'Institution' },
                  { num: 2, label: 'Departments' },
                  { num: 3, label: isRejected ? 'Resubmit' : 'Plan' }
                ].map((s) => (
                  <button
                    key={s.num}
                    type="button"
                    onClick={() => setCurrentStep(s.num)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                      currentStep === s.num
                        ? 'bg-white text-emerald-950 shadow-md shadow-black/10'
                        : 'text-white/80 hover:bg-white/15 hover:text-white'
                    }`}
                  >
                    <span className={`w-4 h-4 rounded-full text-[10px] font-black flex items-center justify-center ${
                      currentStep === s.num ? 'bg-emerald-900 text-white' : 'bg-white/20 text-white'
                    }`}>
                      {s.num}
                    </span>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Form Content - Scrollable */}
          <div className="overflow-y-auto flex-1 p-6 sm:p-10 custom-scrollbar">
            <form noValidate onSubmit={handleSubmit(onSubmit)} className="h-full flex flex-col">
              {isRejected && (
                <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 flex-shrink-0">
                  <div className="flex items-start gap-3">
                    <AlertTriangle size={20} className="text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-black uppercase tracking-wider text-rose-700">Application Previously Rejected — Resubmission Mode</p>
                      <p className="text-sm font-medium mt-0.5 text-rose-800 leading-relaxed">
                        {collegeAdminDetails?.rejectionReason || 'Please review your application information across all steps, make necessary corrections, and resubmit for review.'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-white/90 p-1 rounded-xl border border-rose-200/80 shadow-sm shrink-0">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-2">Jump to:</span>
                    {[
                      { step: 1, label: '1. Setup' },
                      { step: 2, label: '2. Branches' },
                      { step: 3, label: '3. Plan' }
                    ].map(tab => (
                      <button
                        key={tab.step}
                        type="button"
                        onClick={() => setCurrentStep(tab.step)}
                        className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                          currentStep === tab.step ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600 hover:bg-rose-100/60'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <AnimatePresence mode="wait">
                {currentStep === 1 ? (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-8"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                      {/* Left Side: Fields */}
                      <div className="lg:col-span-2 space-y-6">
                        <div className="space-y-4">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Basic Information</p>

                          <div className="space-y-1">
                            <Input
                              label="Official Institution Name"
                              placeholder="e.g. IIT Bombay"
                              {...register('name')}
                              error={errors.name?.message as string}
                              className="bg-slate-50/50 h-12"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input
                              label="Short Name (Optional)"
                              placeholder="e.g. IITB"
                              {...register('shortName')}
                              className="bg-slate-50/50 h-11"
                            />
                            <Input
                              label="Year Established (Optional)"
                              placeholder="e.g. 1958"
                              {...register('yearEstablished')}
                              className="bg-slate-50/50 h-11"
                            />
                          </div>

                          <Input
                            label="Official Website (Optional)"
                            placeholder="https://iitb.ac.in"
                            icon={<Globe size={16} />}
                            {...register('website')}
                            error={errors.website?.message as string}
                            className="bg-slate-50/50 h-11"
                          />

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input
                              label="City"
                              placeholder="e.g. Mumbai"
                              {...register('city')}
                              error={errors.city?.message as string}
                              className="bg-slate-50/50 h-11"
                            />
                            <Input
                              label="State"
                              placeholder="e.g. Maharashtra"
                              {...register('state')}
                              error={errors.state?.message as string}
                              className="bg-slate-50/50 h-11"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input
                              label="Full Address (Optional)"
                              placeholder="Powai, Mumbai - 400076"
                              icon={<MapPin size={16} />}
                              {...register('address')}
                              className="bg-slate-50/50 h-11"
                            />
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-slate-500 ml-1">NAAC Grade (Optional)</label>
                              <select
                                className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 h-11 text-text-main outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all text-sm font-medium appearance-none cursor-pointer"
                                {...register('naacGrade')}
                              >
                                <option value="">Select...</option>
                                <option value="A++">A++</option>
                                <option value="A+">A+</option>
                                <option value="A">A</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Side: Logo */}
                      <div className="lg:w-full space-y-4">
                        <label className="text-sm font-bold text-slate-800 ml-1">Institution Logo</label>
                        <div className="relative aspect-square w-full rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center p-6 text-center group hover:border-emerald-500 hover:bg-emerald-50/30 transition-all cursor-pointer overflow-hidden">
                          <input type="file" accept="image/png, image/jpeg" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={handleLogoUpload} />
                          {watch('logoUrl') ? (
                            <img src={watch('logoUrl')} alt="Logo preview" className="absolute inset-0 w-full h-full object-contain p-2" />
                          ) : (
                            <>
                              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <Upload size={24} />
                              </div>
                              <p className="text-[11px] font-bold text-slate-600 mb-1">
                                Drag & drop or <span className="text-emerald-600">browse to upload</span>
                              </p>
                              <p className="text-[10px] text-slate-400 font-medium">PNG, JPG up to 2MB</p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : currentStep === 2 ? (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-8"
                  >
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-bold text-slate-800 ml-1">Active Branches</label>
                        <p className="text-xs text-slate-400 ml-1 mt-1 font-medium">Add at least one academic branch your institution offers.</p>
                      </div>

                      <div className="flex gap-2">
                        <div className="flex-1">
                          <div className="flex flex-col gap-2 w-full">
                            <select
                              className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 h-12 text-sm font-medium outline-none focus:border-emerald-500 appearance-none cursor-pointer"
                              value={branchInput}
                              onChange={(e) => setBranchInput(e.target.value)}
                            >
                              <option value="">Select a branch to add...</option>
                              {PLATFORM_BRANCHES.map((b) => (
                                <option key={b} value={b}>{b}</option>
                              ))}
                              <option value="custom">Other (Add Custom Branch)...</option>
                            </select>
                            {branchInput === 'custom' && (
                              <input
                                type="text"
                                placeholder="Type your custom branch name..."
                                className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 h-12 text-sm font-medium outline-none focus:border-emerald-500"
                                value={customBranch}
                                onChange={(e) => setCustomBranch(e.target.value)}
                                autoFocus
                              />
                            )}
                          </div>
                        </div>
                        <Button type="button" onClick={addBranch} className="h-12 px-6 bg-emerald-50 text-emerald-600 border-none hover:bg-emerald-100 font-bold transition-all">
                          + Add
                        </Button>
                      </div>

                      <div className="flex flex-wrap gap-2 min-h-[60px] p-4 rounded-2xl bg-slate-50/30 border border-slate-100">
                        {activeBranches.map(branch => (
                          <span key={branch} className="flex items-center gap-1.5 px-3 py-1.5 bg-white shadow-sm text-emerald-700 rounded-lg text-xs font-bold border border-emerald-100">
                            {branch}
                            <button type="button" onClick={() => removeBranch(branch)} className="text-emerald-300 hover:text-rose-500 transition-colors">
                              <X size={14} />
                            </button>
                          </span>
                        ))}
                        {activeBranches.length === 0 && <p className="text-xs text-slate-300 font-medium italic">No branches added yet...</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-800 ml-1">Current Academic Year</label>
                        <select
                          className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 h-12 text-sm font-bold text-slate-900 appearance-none cursor-pointer outline-none focus:border-emerald-500"
                          {...register('currentAcademicYear')}
                        >
                          <option value="" disabled>Select Year</option>
                          <option value="2024 - 2025">2024 - 2025</option>
                          <option value="2025 - 2026">2025 - 2026</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-800 ml-1">Active Placement Batch</label>
                        <select
                          className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 h-12 text-sm font-bold text-slate-900 appearance-none cursor-pointer outline-none focus:border-emerald-500"
                          {...register('activePlacementBatch')}
                        >
                          <option value="" disabled>Select Batch</option>
                          <option value="Batch 2025">Batch 2025</option>
                          <option value="Batch 2026">Batch 2026</option>
                        </select>
                      </div>
                    </div>
                  </motion.div>
                ) : currentStep === 3 ? (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-8"
                  >
                    <div className="text-center mb-4">
                      <p className="text-xs font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 inline-block px-4 py-1.5 rounded-full border border-emerald-100">
                        🎁 Special Offer: 14-Day Free Trial on all Premium Plans
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                      <div
                        onClick={() => setValue('plan', 'basic', { shouldValidate: true })}
                        className={`relative p-8 rounded-[32px] border-2 transition-all cursor-pointer ${plan === 'basic' ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-100 bg-white hover:border-emerald-200 shadow-sm'
                          }`}
                      >
                        <div className="flex justify-between items-start mb-6">
                          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest">Basic</span>
                          {plan === 'basic' && <CheckCircle2 className="text-emerald-500" size={24} />}
                        </div>
                        <div className="mb-8">
                          <h3 className="text-xl font-black text-slate-900 mb-1">Basic</h3>
                          <p className="text-3xl font-black text-slate-900">₹99K <span className="text-sm text-slate-400 font-bold">/year</span></p>
                          <p className="text-[10px] text-emerald-600 font-bold mt-1">Includes 14-day trial</p>
                        </div>
                        <ul className="space-y-4">
                          {["Up to 150 students", "1 admin account", "2,000 AI credits/yr", "Resume builder"].map((f, i) => (
                            <li key={i} className="flex items-center gap-3 text-sm font-medium text-slate-600">
                              <Check size={16} className="text-emerald-500 flex-shrink-0" /> {f}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div
                        onClick={() => setValue('plan', 'pro', { shouldValidate: true })}
                        className={`relative p-8 rounded-[32px] border-2 transition-all cursor-pointer ${plan === 'pro' ? 'border-[rgb(11,45,31)] bg-emerald-50/30' : 'border-slate-100 bg-white hover:border-emerald-200 shadow-sm'
                          }`}
                      >
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-[rgb(11,45,31)] text-white rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg">
                          <Star size={10} fill="currentColor" /> Most Popular
                        </div>
                        <div className="flex justify-between items-start mb-6">
                          <span className="px-3 py-1 bg-emerald-100 text-[rgb(11,45,31)] rounded-full text-[10px] font-black uppercase tracking-widest">Pro</span>
                          {plan === 'pro' && <CheckCircle2 className="text-[rgb(11,45,31)]" size={24} />}
                        </div>
                        <div className="mb-8">
                          <h3 className="text-xl font-black text-slate-900 mb-1">Pro</h3>
                          <p className="text-3xl font-black text-slate-900">₹2.4L <span className="text-sm text-slate-400 font-bold">/year</span></p>
                          <p className="text-[10px] text-emerald-600 font-bold mt-1">Includes 14-day trial</p>
                        </div>
                        <ul className="space-y-4">
                          {["Unlimited students", "5 admin accounts", "10,000 AI credits/yr", "Mock interview bot"].map((f, i) => (
                            <li key={i} className="flex items-center gap-3 text-sm font-medium text-slate-700">
                              <Check size={16} className="text-[rgb(11,45,31)] flex-shrink-0" /> {f}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Verification Documents & Proof Section */}
                    <div className="mt-8 p-6 bg-slate-50 border border-slate-200 rounded-3xl space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-3">
                        <div>
                          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                            <ShieldCheck size={18} className="text-emerald-600" />
                            Verification Documents & Proof *
                          </h3>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Upload at least one official recognition, affiliation, or establishment document (UGC, AICTE, Govt. Affiliation, or Letter).
                          </p>
                        </div>
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 self-start sm:self-auto">
                          Required (Min 1 Document)
                        </span>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                        {/* Category Selector & Upload Dropzone */}
                        <div className="space-y-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 ml-1">Document Category</label>
                            <select
                              value={selectedDocCategory}
                              onChange={(e) => setSelectedDocCategory(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-xl px-4 h-11 text-xs font-bold text-slate-800 outline-none focus:border-emerald-500 cursor-pointer"
                            >
                              {COLLEGE_VERIFICATION_CATEGORIES.map((cat) => (
                                <option key={cat.value} value={cat.value}>{cat.label}</option>
                              ))}
                            </select>
                          </div>

                          <div className="relative border-2 border-dashed border-emerald-200 bg-emerald-50/20 hover:bg-emerald-50/50 hover:border-emerald-400 rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all cursor-pointer group">
                            <input
                              type="file"
                              accept=".pdf,.png,.jpg,.jpeg,.webp"
                              disabled={isUploadingDoc}
                              onChange={handleVerificationDocUpload}
                              className="absolute inset-0 opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
                            />
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                              {isUploadingDoc ? <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" /> : <Upload size={20} />}
                            </div>
                            <p className="text-xs font-bold text-slate-700 mb-0.5">
                              {isUploadingDoc ? 'Uploading document...' : 'Click or drag file to upload'}
                            </p>
                            <p className="text-[10px] text-slate-400 font-medium">PDF, JPG, PNG, WEBP (Max 10MB)</p>
                          </div>
                        </div>

                        {/* Uploaded Documents List */}
                        <div className="lg:col-span-2 space-y-3">
                          <label className="text-xs font-bold text-slate-700 ml-1">
                            Submitted Documents ({verificationDocuments.length})
                          </label>
                          {verificationDocuments.length === 0 ? (
                            <div className="p-8 rounded-2xl border border-dashed border-slate-200 bg-white text-center flex flex-col items-center justify-center">
                              <FileText size={28} className="text-slate-300 mb-2" />
                              <p className="text-xs font-bold text-slate-500">No verification documents uploaded yet.</p>
                              <p className="text-[11px] text-slate-400 mt-1 max-w-sm">
                                Please select a category and upload at least one official document for Super Admin review.
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                              {verificationDocuments.map((doc) => {
                                const catObj = COLLEGE_VERIFICATION_CATEGORIES.find(c => c.value === doc.category);
                                const categoryLabel = catObj ? catObj.label : doc.category;
                                return (
                                  <div
                                    key={doc.id}
                                    className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-emerald-200 transition-all"
                                  >
                                    <div className="flex items-center gap-3 overflow-hidden">
                                      <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                        <FileText size={18} />
                                      </div>
                                      <div className="overflow-hidden">
                                        <div className="flex items-center gap-2">
                                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 truncate">
                                            {categoryLabel}
                                          </span>
                                        </div>
                                        <p className="text-xs font-bold text-slate-800 truncate mt-0.5">
                                          {doc.fileName}
                                        </p>
                                        <p className="text-[10px] text-slate-400">
                                          {doc.fileSize ? `${(doc.fileSize / (1024 * 1024)).toFixed(2)} MB • ` : ''}
                                          {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : 'Just now'}
                                        </p>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                      <a
                                        href={doc.fileUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="p-2 rounded-xl text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                                        title="View Document"
                                      >
                                        <Download size={16} />
                                      </a>
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveVerificationDoc(doc.id)}
                                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                        title="Remove Document"
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Resubmission Summary on Step 3 */}
                    {isRejected && (
                      <div className="mt-8 p-6 bg-slate-50 border border-slate-200 rounded-3xl space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
                          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Application Resubmission Summary</h3>
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                            Ready to Resubmit
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                          <div className="bg-white p-3.5 rounded-2xl border border-slate-100">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Institution</span>
                            <p className="font-bold text-slate-800 text-sm mt-0.5 truncate">{watch('name') || collegeAdminDetails?.collegeName || 'N/A'}</p>
                            <p className="text-slate-500 text-[11px] mt-0.5">{[watch('city'), watch('state')].filter(Boolean).join(', ') || 'Location provided'}</p>
                          </div>
                          <div className="bg-white p-3.5 rounded-2xl border border-slate-100">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Academic Branches</span>
                            <p className="font-bold text-slate-800 text-sm mt-0.5">
                              {activeBranches.length > 0 ? `${activeBranches.length} branch${activeBranches.length > 1 ? 'es' : ''} added` : 'No branches specified'}
                            </p>
                            <p className="text-slate-500 text-[11px] mt-0.5 truncate">{activeBranches.slice(0, 2).join(', ')}{activeBranches.length > 2 ? '...' : ''}</p>
                          </div>
                          <div className="bg-white p-3.5 rounded-2xl border border-slate-100">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Selected Plan</span>
                            <p className="font-bold text-emerald-700 text-sm mt-0.5 uppercase tracking-wide">
                              {plan === 'basic' ? 'Basic (₹99K/yr)' : 'Pro (₹2.4L/yr)'}
                            </p>
                            <p className="text-slate-500 text-[11px] mt-0.5">Includes 14-day trial</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ) : currentStep === 4 ? (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-10 py-6 flex flex-col items-center text-center"
                  >
                    <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center animate-bounce">
                      <CheckCircle2 size={64} strokeWidth={1.5} />
                    </div>

                    <header>
                      <h2 className="text-3xl font-black text-slate-900 mb-3">You're all set!</h2>
                      <p className="text-slate-500 font-medium text-lg max-w-md mx-auto">
                        Your institution setup is complete. You can now access the full dashboard.
                      </p>
                    </header>

                    <div className="w-full max-w-sm bg-slate-50 rounded-2xl p-6 text-left space-y-3 border border-slate-100">
                      {[
                        "Institution profile created", "Departments configured",
                        "Pro plan activated - 14-day trial", "Admin invitations sent"
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                            <Check size={12} />
                          </div>
                          <span className="text-sm font-bold text-slate-700">{item}</span>
                        </div>
                      ))}
                    </div>

                    <Button
                      type="button"
                      onClick={() => router.push('/college')}
                      className="w-full max-w-sm bg-[rgb(11,45,31)] hover:bg-slate-900 text-white h-12 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-900/10 transition-all border-none mt-4"
                    >
                      Go to Dashboard <ArrowRight size={18} />
                    </Button>
                  </motion.div>
                ) : null}
              </AnimatePresence>

              {/* Navigation Buttons - Fixed at bottom */}
              {currentStep < 4 && (
                <div className="flex items-center justify-between pt-6 mt-10 border-t border-slate-100 flex-shrink-0">
                  <div className="flex items-center">
                    {currentStep > 1 ? (
                      <button
                        type="button"
                        onClick={prevStep}
                        className="flex items-center gap-2 text-sm font-black text-slate-400 hover:text-slate-900 transition-all"
                      >
                        <ArrowLeft size={16} /> Back
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleCancelOnboarding}
                        className="flex items-center gap-2 text-sm font-black text-slate-400 hover:text-rose-600 transition-all"
                      >
                        <ArrowLeft size={16} /> {isRejected ? 'Back to Portal' : 'Back to Register'}
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    {isRejected && currentStep < 3 && (
                      <button
                        type="button"
                        onClick={() => setCurrentStep(3)}
                        className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs transition-all"
                      >
                        Skip to Review & Resubmit
                      </button>
                    )}
                    <Button
                      type="submit"
                      disabled={!isValid}
                      isLoading={isLoading}
                      id={isRejected && currentStep === 3 ? "college-resubmit-btn" : undefined}
                      className="px-8 sm:px-10 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-[rgb(11,45,31)] text-white font-black shadow-xl shadow-emerald-900/10 hover:shadow-emerald-900/20 hover:scale-[1.02] transition-all flex items-center gap-2 border-none disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {currentStep === 1
                        ? 'Next: Departments'
                        : currentStep === 2
                        ? 'Next: Review & Plan'
                        : isRejected
                        ? 'Resubmit Application for Review'
                        : 'Continue'}
                      {isRejected && currentStep === 3 ? <Send size={16} /> : <ArrowRight size={18} />}
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
