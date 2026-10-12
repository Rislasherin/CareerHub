'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Building2, MapPin, Phone, Mail,
  ArrowRight, ArrowLeft, Globe,
  X, Upload, Check, Star, Briefcase,
  AlertTriangle, Send, FileText, Trash2, CheckCircle2, ShieldCheck, Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/shared/Button';
import { Input } from '@/components/shared/Input';
import { updateHROnboarding, resubmitHROnboarding, logoutUser } from '@/services/auth/auth.service';
import { apiClient } from '@/services/api/api.client';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setHRDetails, clearHRDetails, VerificationDocumentItem } from '@/redux/slices/hrSlice';
import { clearAuth } from '@/redux/slices/authSlice';

export const COMPANY_VERIFICATION_CATEGORIES = [
  { value: 'INCORPORATION_CERTIFICATE', label: 'Certificate of Incorporation / Registration Certificate' },
  { value: 'GST_CERTIFICATE', label: 'GST Registration Certificate' },
  { value: 'MSME_CERTIFICATE', label: 'Udyam / MSME Registration Certificate' },
  { value: 'ESTABLISHMENT_LICENSE', label: 'Shop & Establishment Licence / Business Registration' },
  { value: 'OTHER', label: 'Other Official Business Verification Document' },
] as const;

const step1Schema = z.object({
  name: z.string()
    .trim()
    .min(2, 'Registered company name must be at least 2 characters')
    .max(100, 'Company name cannot exceed 100 characters')
    .refine((val) => !/^Pending Company/i.test(val.trim()), {
      message: 'Please enter your actual registered company name, not a placeholder',
    }),
  website: z.string().optional().or(z.literal('')),
  industry: z.string().optional().or(z.literal('')),
  headquarters: z.string().optional(),
  description: z.string().optional(),
});

const step2Schema = z.object({
  size: z.string().optional().or(z.literal('')),
  industry: z.string().optional().or(z.literal('')),
});

const step3Schema = z.object({
  contactName: z.string().min(3, 'Contact name is required'),
  jobTitle: z.string().optional(),
  contactEmail: z.string().email('Invalid email address').optional().or(z.literal('')),
  contactPhone: z.string().optional(),
  preferredColleges: z.array(z.string()).optional(),
  logoUrl: z.string().optional(),
});

const steps = [
  { id: 'company', title: 'Company Details', description: 'Company Details' },
  { id: 'team', title: 'Team & Hiring', description: 'Team & Hiring Preferences' },
  { id: 'final', title: 'Contacts & Preferences', description: 'Contacts & Preferences' }
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
  const isRejected = hrDetails?.status?.toUpperCase() === 'REJECTED';
  const hasInitializedRef = useRef(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (hrDetails) {
      if (!hasInitializedRef.current) {
        hasInitializedRef.current = true;
        const requestedStep = searchParams?.get('step');
        if (requestedStep && ['1', '2', '3'].includes(requestedStep)) {
          setCurrentStep(parseInt(requestedStep, 10));
        } else if (isRejected) {
          setCurrentStep(1);
        } else if (hrDetails?.onboardingStep) {
          setCurrentStep(Math.min(hrDetails.onboardingStep + 1, steps.length));
        }
      }
    }
  }, [hrDetails, isRejected, searchParams]);

  const [isLoading, setIsLoading] = useState(false);
  const [collegeInput, setCollegeInput] = useState('');
  const [verificationDocuments, setVerificationDocuments] = useState<VerificationDocumentItem[]>([]);
  const [selectedDocCategory, setSelectedDocCategory] = useState<string>('INCORPORATION_CERTIFICATE');
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);

  const { register, handleSubmit, formState: { errors, isValid }, setValue, watch, getValues } = useForm<HRFormValues>({
    mode: 'all',
    shouldUnregister: false,
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

  // Prefill existing company data
  useEffect(() => {
    if (hrDetails) {
      const rawName = hrDetails.name || hrDetails.companyName || '';
      if (rawName && !/^Pending Company/i.test(rawName.trim())) {
        setValue('name', rawName, { shouldValidate: true });
      } else {
        setValue('name', '', { shouldValidate: false });
      }
      if (hrDetails.website) setValue('website', hrDetails.website, { shouldValidate: true });
      if (hrDetails.industry || hrDetails.sector) {
        setValue('industry', hrDetails.industry || hrDetails.sector || '', { shouldValidate: true });
      }
      if (hrDetails.headquarters || hrDetails.location) {
        setValue('headquarters', hrDetails.headquarters || hrDetails.location || '', { shouldValidate: true });
      }
      if (hrDetails.description) setValue('description', hrDetails.description, { shouldValidate: true });
      if (hrDetails.size) setValue('size', hrDetails.size, { shouldValidate: true });
      if (hrDetails.contactName) {
        setValue('contactName', hrDetails.contactName, { shouldValidate: true });
      } else if (hrDetails.firstName || hrDetails.lastName) {
        setValue('contactName', [hrDetails.firstName, hrDetails.lastName].filter(Boolean).join(' '), { shouldValidate: true });
      }
      if (hrDetails.contactJobTitle) setValue('jobTitle', hrDetails.contactJobTitle, { shouldValidate: true });
      if (hrDetails.contactEmail || hrDetails.email) setValue('contactEmail', hrDetails.contactEmail || hrDetails.email, { shouldValidate: true });
      if (hrDetails.contactPhone) setValue('contactPhone', hrDetails.contactPhone, { shouldValidate: true });
      if (hrDetails.preferredColleges && hrDetails.preferredColleges.length > 0) {
        setValue('preferredColleges', hrDetails.preferredColleges, { shouldValidate: true });
      }
      if (hrDetails.logoUrl) setValue('logoUrl', hrDetails.logoUrl, { shouldValidate: true });

      if (hrDetails.verificationDocuments && hrDetails.verificationDocuments.length > 0) {
        setVerificationDocuments(hrDetails.verificationDocuments);
      } else if (hrDetails.verificationDocument) {
        setVerificationDocuments([{
          id: 'legacy-doc',
          category: 'OTHER',
          fileName: hrDetails.verificationDocument.split('/').pop() || 'Verification Document',
          fileUrl: hrDetails.verificationDocument,
          uploadedAt: new Date()
        }]);
      }
    }
  }, [hrDetails, setValue]);

  const preferredColleges = watch('preferredColleges') || [];
  const size = watch('size');
  const industry = watch('industry');

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, steps.length));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleCancelOnboarding = async () => {
    if (isRejected) {
      router.push('/hr');
      return;
    }
    setIsLoading(true);
    try {
      await logoutUser();
    } catch { }
    dispatch(clearAuth());
    dispatch(clearHRDetails());
    window.location.href = '/hr/register';
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

  const addCollege = () => {
    if (collegeInput.trim() && !preferredColleges.includes(collegeInput.trim())) {
      setValue('preferredColleges', [...preferredColleges, collegeInput.trim()], { shouldValidate: true });
      setCollegeInput('');
    }
  };

  const removeCollege = (college: string) => {
    setValue('preferredColleges', preferredColleges.filter(c => c !== college), { shouldValidate: true });
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

      const response: any = await apiClient.post('/auth/hr/verification-documents', formData, {
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
      await apiClient.delete(`/auth/hr/verification-documents/${docId}`);
      setVerificationDocuments(prev => prev.filter(d => d.id !== docId));
      toast.success('Document removed');
    } catch (err: any) {
      toast.error('Failed to remove document');
    }
  };

  const onSubmit = async (data: any) => {
    // If completing the final step (Step 3), ensure at least 1 verification document is uploaded
    if (currentStep === steps.length) {
      if (verificationDocuments.length === 0) {
        toast.error('Please upload at least one official business verification document before final submission.');
        return;
      }
    }

    setIsLoading(true);
    try {
      const isResubmission = isRejected && currentStep === steps.length;
      const allFormValues = getValues();
      const payload = {
        ...allFormValues,
        ...data,
        step: currentStep,
        verificationDocuments,
        ...(isResubmission ? { resubmit: true } : {})
      };

      const updatedCompany = (await (isResubmission ? resubmitHROnboarding(payload) : updateHROnboarding(payload))) as any;

      // Update Redux state with new onboarding step, company info, and verification documents
      if (hrDetails) {
        dispatch(setHRDetails({
          ...hrDetails,
          companyName: updatedCompany.name,
          name: updatedCompany.name,
          onboardingStep: updatedCompany.onboardingStep,
          industry: updatedCompany.industry,
          verificationDocuments: updatedCompany.verificationDocuments || verificationDocuments,
          verificationDocument: updatedCompany.verificationDocument,
          status: isResubmission ? 'PENDING' : (updatedCompany.status || hrDetails.status),
          rejectionReason: isResubmission ? undefined : hrDetails.rejectionReason
        }));
      }

      if (currentStep < steps.length) {
        nextStep();
      } else {
        if (isResubmission) {
          toast.success('Company application resubmitted successfully for review!');
        } else {
          toast.success('Onboarding completed successfully!');
        }
        router.push('/hr');
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
              {/* Interactive Progress Bars */}
              <div className="flex gap-2 w-36 items-center">
                {steps.map((s, i) => (
                  <button
                    key={s.id}
                    type="button"
                    title={`Go to Step ${i + 1}`}
                    onClick={() => setCurrentStep(i + 1)}
                    className={`h-2 flex-1 rounded-full transition-all duration-300 cursor-pointer ${
                      i + 1 <= currentStep ? 'bg-white shadow-sm' : 'bg-white/25 hover:bg-white/40'
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
                  {currentStep === 1 && "Welcome! Set up your company profile"}
                  {currentStep === 2 && "Tell us about your team"}
                  {currentStep === 3 && (isRejected ? "Review Application & Resubmit" : "Final touches — almost there!")}
                </h1>
                <p className="text-white/60 text-xs font-medium uppercase tracking-wider">
                  Step {currentStep} of 3 — {steps[currentStep - 1]?.description}
                </p>
              </motion.div>

              {/* Interactive Step Pills */}
              <div className="flex items-center gap-1.5 bg-white/10 p-1 rounded-2xl border border-white/15 backdrop-blur-sm overflow-x-auto">
                {steps.map((s, idx) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setCurrentStep(idx + 1)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                      currentStep === idx + 1
                        ? 'bg-white text-indigo-950 shadow-md shadow-black/10'
                        : 'text-white/80 hover:bg-white/15 hover:text-white'
                    }`}
                  >
                    <span className={`w-4 h-4 rounded-full text-[10px] font-black flex items-center justify-center ${
                      currentStep === idx + 1 ? 'bg-indigo-900 text-white' : 'bg-white/20 text-white'
                    }`}>
                      {idx + 1}
                    </span>
                    {idx === 0 ? 'Company' : idx === 1 ? 'Team' : isRejected ? 'Resubmit' : 'Contacts'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Form Content - Scrollable */}
          <div className="overflow-y-auto flex-1 p-6 sm:p-10 custom-scrollbar">
            <form noValidate onSubmit={handleSubmit(onSubmit)} className="h-full flex flex-col">
              {isRejected && (
                <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle size={20} className="text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-black text-rose-950 uppercase tracking-wider">
                        Application Revision Required — Resubmission Mode
                      </h4>
                      <p className="text-sm text-rose-900 font-medium mt-1 leading-relaxed bg-white/70 p-3 rounded-xl border border-rose-100">
                        {hrDetails?.rejectionReason || "Please review and correct your company details across all steps before resubmitting."}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-white/90 p-1 rounded-xl border border-rose-200/80 shadow-sm shrink-0">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-2">Jump to:</span>
                    {steps.map((s, idx) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setCurrentStep(idx + 1)}
                        className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                          currentStep === idx + 1 ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600 hover:bg-rose-100/60'
                        }`}
                      >
                        {idx + 1}. {idx === 0 ? 'Company' : idx === 1 ? 'Team' : 'Contacts'}
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
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <Input
                          label="Registered Company Name *"
                          placeholder="e.g. Acme Technologies Private Limited"
                          {...register('name')}
                          error={errors.name?.message as string}
                          className="bg-slate-50/50 h-12"
                        />
                        <p className="text-[11px] text-slate-400 ml-1">
                          Enter your legal registered company name as documented in your official certificates.
                        </p>
                      </div>
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
                ) : currentStep === 2 ? (
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
                            className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 border ${size === s
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
                ) : currentStep === 3 ? (
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
                          <label className="text-sm font-bold text-slate-700 ml-1">Preferred Colleges (Optional)</label>
                          <div className="flex gap-2">
                            <Input
                              placeholder="e.g. IIT Bombay"
                              value={collegeInput}
                              onChange={(e) => setCollegeInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  addCollege();
                                }
                              }}
                              className="bg-slate-50/50 h-11 flex-1"
                            />
                            <Button 
                              type="button" 
                              onClick={addCollege}
                              className="h-11 px-4 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl font-bold"
                            >
                              Add
                            </Button>
                          </div>
                          
                          {preferredColleges.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {preferredColleges.map(college => (
                                <div 
                                  key={college}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-lg text-sm font-semibold text-indigo-700"
                                >
                                  {college}
                                  <button
                                    type="button"
                                    onClick={() => removeCollege(college)}
                                    className="p-0.5 hover:bg-indigo-200 rounded-md transition-colors"
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="lg:w-64 space-y-4">
                        <label className="text-sm font-bold text-slate-800 ml-1">Company Logo</label>
                        <div className="relative aspect-square w-full rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center p-6 text-center group hover:border-indigo-400 hover:bg-indigo-50/30 transition-all cursor-pointer overflow-hidden">
                          <input type="file" accept="image/png, image/jpeg" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={handleLogoUpload} />
                          {watch('logoUrl') ? (
                            <img src={watch('logoUrl')} alt="Logo preview" className="absolute inset-0 w-full h-full object-contain p-2" />
                          ) : (
                            <>
                              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <Upload size={24} />
                              </div>
                              <p className="text-[11px] font-bold text-slate-600 mb-1">
                                Drag & drop or <span className="text-indigo-600">browse to upload</span>
                              </p>
                              <p className="text-[10px] text-slate-400 font-medium">PNG, JPG up to 2MB</p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Verification Documents & Proof Section */}
                    <div className="mt-8 p-6 bg-slate-50 border border-slate-200 rounded-3xl space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-3">
                        <div>
                          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                            <ShieldCheck size={18} className="text-indigo-600" />
                            Verification Documents & Proof *
                          </h3>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Upload at least one official business registration document (Certificate of Incorporation, GST, MSME, or Licence).
                          </p>
                        </div>
                        <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200 self-start sm:self-auto">
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
                              className="w-full bg-white border border-slate-200 rounded-xl px-4 h-11 text-xs font-bold text-slate-800 outline-none focus:border-indigo-500 cursor-pointer"
                            >
                              {COMPANY_VERIFICATION_CATEGORIES.map((cat) => (
                                <option key={cat.value} value={cat.value}>{cat.label}</option>
                              ))}
                            </select>
                          </div>

                          <div className="relative border-2 border-dashed border-indigo-200 bg-indigo-50/20 hover:bg-indigo-50/50 hover:border-indigo-400 rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all cursor-pointer group">
                            <input
                              type="file"
                              accept=".pdf,.png,.jpg,.jpeg,.webp"
                              disabled={isUploadingDoc}
                              onChange={handleVerificationDocUpload}
                              className="absolute inset-0 opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
                            />
                            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                              {isUploadingDoc ? <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" /> : <Upload size={20} />}
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
                                const catObj = COMPANY_VERIFICATION_CATEGORIES.find(c => c.value === doc.category);
                                const categoryLabel = catObj ? catObj.label : doc.category;
                                return (
                                  <div
                                    key={doc.id}
                                    className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-indigo-200 transition-all"
                                  >
                                    <div className="flex items-center gap-3 overflow-hidden">
                                      <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                                        <FileText size={18} />
                                      </div>
                                      <div className="overflow-hidden">
                                        <div className="flex items-center gap-2">
                                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 truncate">
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
                                        className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
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
                          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Company Resubmission Summary</h3>
                          <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
                            Ready to Resubmit
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                          <div className="bg-white p-3.5 rounded-2xl border border-slate-100">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Company</span>
                            <p className="font-bold text-slate-800 text-sm mt-0.5 truncate">{watch('name') || hrDetails?.companyName || 'N/A'}</p>
                            <p className="text-slate-500 text-[11px] mt-0.5 truncate">{watch('headquarters') || 'Location provided'}</p>
                          </div>
                          <div className="bg-white p-3.5 rounded-2xl border border-slate-100">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Industry & Size</span>
                            <p className="font-bold text-slate-800 text-sm mt-0.5 truncate">
                              {watch('industry') || hrDetails?.industry || 'Not specified'}
                            </p>
                            <p className="text-slate-500 text-[11px] mt-0.5">{watch('size') ? `${watch('size')} employees` : 'Team size provided'}</p>
                          </div>
                          <div className="bg-white p-3.5 rounded-2xl border border-slate-100">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Contact Representative</span>
                            <p className="font-bold text-indigo-700 text-sm mt-0.5 truncate">
                              {watch('contactName') || 'Contact name'}
                            </p>
                            <p className="text-slate-500 text-[11px] mt-0.5 truncate">{watch('contactEmail') || 'Email provided'}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ) : null}
              </AnimatePresence>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between pt-6 mt-10 border-t border-slate-100">
                <div className="flex items-center">
                  {currentStep > 1 ? (
                    <button
                      type="button"
                      onClick={prevStep}
                      className="flex items-center gap-2 text-sm font-black text-slate-400 hover:text-slate-900 transition-all cursor-pointer"
                    >
                      <ArrowLeft size={16} /> Back
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleCancelOnboarding}
                      className="flex items-center gap-2 text-sm font-black text-slate-400 hover:text-rose-600 transition-all cursor-pointer"
                    >
                      <ArrowLeft size={16} /> {isRejected ? "Return to Dashboard" : "Back to Register"}
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {isRejected && currentStep < 3 && (
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs transition-all cursor-pointer"
                    >
                      Skip to Review & Resubmit
                    </button>
                  )}
                  <Button
                    type="submit"
                    isLoading={isLoading}
                    disabled={!isValid || isLoading}
                    id={isRejected && currentStep === 3 ? "hr-resubmit-btn" : undefined}
                    className="px-8 sm:px-10 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 disabled:opacity-50 text-white font-black shadow-xl shadow-indigo-200/50 hover:shadow-indigo-300/50 hover:scale-[1.02] transition-all flex items-center gap-2 border-none"
                  >
                    {currentStep === 1
                      ? "Next: Team & Hiring"
                      : currentStep === 2
                      ? "Next: Contacts & Preferences"
                      : isRejected
                      ? "Resubmit Company Application for Review"
                      : "🚀 Complete Setup"}
                    {isRejected && currentStep === 3 ? <Send size={16} /> : <ArrowRight size={18} />}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
