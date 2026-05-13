'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  GraduationCap, MapPin, Globe, 
  ArrowRight, ArrowLeft, Building2, 
  Users, BarChart3, Link as LinkIcon, 
  CheckCircle2, X, Upload, Check, Star,
  Mail, Phone, Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/shared/Button';
import { Input } from '@/components/shared/Input';
import { updateCollegeOnboarding } from '@/services/auth/auth.service';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setCollegeAdminDetails } from '@/redux/slices/collegeAdminSlice';

const step1Schema = z.object({
  name: z.string().min(3, 'Institution name must be at least 3 characters'),
  shortName: z.string().optional(),
  yearEstablished: z.string().optional(),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  address: z.string().optional(),
  naacGrade: z.string().optional(),
  logoUrl: z.string().optional(),
});

const step2Schema = z.object({
  activeBranches: z.array(z.string()).min(1, 'Add at least one branch'),
  currentAcademicYear: z.string().min(1),
  activePlacementBatch: z.string().min(1),
});

const step3Schema = z.object({
  plan: z.enum(['basic', 'pro']),
});

const steps = [
  { id: 'institution', title: 'Institution Setup', description: 'Institution Setup' },
  { id: 'departments', title: 'Departments & Branches', description: 'Departments & Branches' },
  { id: 'plan', title: 'Choose Plan', description: 'Choose your plan' },
  { id: 'complete', title: 'All Set!', description: 'All Set!' }
];

interface CollegeFormValues {
  name: string;
  shortName: string;
  yearEstablished: string;
  website: string;
  address: string;
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
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    if (collegeAdminDetails?.onboardingStep) {
      setCurrentStep(Math.min(collegeAdminDetails.onboardingStep + 1, steps.length));
    }
  }, [collegeAdminDetails]);

  const [isLoading, setIsLoading] = useState(false);
  const [branchInput, setBranchInput] = useState('');
  const router = useRouter();

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<CollegeFormValues>({
    resolver: zodResolver(
      currentStep === 1 ? step1Schema : 
      currentStep === 2 ? step2Schema : 
      step3Schema
    ) as any,
    defaultValues: {
      name: '',
      shortName: '',
      yearEstablished: '',
      website: '',
      address: '',
      naacGrade: '',
      activeBranches: [] as string[],
      currentAcademicYear: '2024 - 2025',
      activePlacementBatch: 'Batch 2025',
      plan: 'pro' as 'basic' | 'pro',
      logoUrl: ''
    }
  });

  const activeBranches = watch('activeBranches');
  const plan = watch('plan');

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, steps.length));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const addBranch = () => {
    if (branchInput.trim() && !activeBranches.includes(branchInput.trim())) {
      setValue('activeBranches', [...activeBranches, branchInput.trim()], { shouldValidate: true });
      setBranchInput('');
    }
  };

  const removeBranch = (branch: string) => {
    setValue('activeBranches', activeBranches.filter(b => b !== branch), { shouldValidate: true });
  };

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const updatedOrg = await updateCollegeOnboarding({ ...data, step: currentStep });
      
      if (collegeAdminDetails) {
        dispatch(setCollegeAdminDetails({
          ...collegeAdminDetails,
          collegeName: updatedOrg.name,
          onboardingStep: updatedOrg.onboardingStep,
          status: updatedOrg.status || collegeAdminDetails.status
        }));
      }

      if (currentStep < steps.length) {
        nextStep();
      } else {
        toast.success('Onboarding completed successfully!');
        router.push('/college');
      }
    } catch (error) {
      toast.error('Failed to update onboarding info.');
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
                {currentStep === 1 && "Welcome! Set up your institution"}
                {currentStep === 2 && "Departments & Branches"}
                {currentStep === 3 && "Choose your plan"}
                {currentStep === 4 && "You're all set!"}
              </h1>
              <p className="text-white/60 text-xs font-medium uppercase tracking-wider">
                Step {currentStep} of 4 — {steps[currentStep-1].description}
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
                        <div className="aspect-square w-full rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center p-6 text-center group hover:border-emerald-500 hover:bg-emerald-50/30 transition-all cursor-pointer">
                          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <Upload size={24} />
                          </div>
                          <p className="text-[11px] font-bold text-slate-600 mb-1">
                            Drag & drop or <span className="text-emerald-600">browse to upload</span>
                          </p>
                          <p className="text-[10px] text-slate-400 font-medium">PNG, JPG up to 2MB</p>
                        </div>
                      </div>
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
                       <div>
                         <label className="text-sm font-bold text-slate-800 ml-1">Active Branches</label>
                         <p className="text-xs text-slate-400 ml-1 mt-1 font-medium">Add at least one academic branch your institution offers.</p>
                       </div>
                       
                       <div className="flex gap-2">
                         <div className="flex-1">
                            <select 
                              className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 h-12 text-sm font-medium outline-none focus:border-emerald-500 appearance-none cursor-pointer"
                              value={branchInput}
                              onChange={(e: any) => setBranchInput(e.target.value)}
                            >
                              <option value="">Select a branch to add...</option>
                              <option value="Computer Science and Engineering">B.Tech - CS & Engineering</option>
                              <option value="Information Technology">B.Tech - Information Technology</option>
                              <option value="Artificial Intelligence & Data Science">B.Tech - AI & Data Science</option>
                              <option value="MCA">MCA (Master of Computer Applications)</option>
                              <option value="M.Tech - Computer Science">M.Tech - Computer Science</option>
                              <option value="M.Tech - IT">M.Tech - IT</option>
                              <option value="M.Sc - Computer Science">M.Sc - Computer Science</option>
                              <option value="Cyber Security">Cyber Security</option>
                              <option value="Software Engineering">Software Engineering</option>
                            </select>
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
                           <option>2024 - 2025</option>
                           <option>2025 - 2026</option>
                         </select>
                       </div>
                       <div className="space-y-2">
                         <label className="text-sm font-bold text-slate-800 ml-1">Active Placement Batch</label>
                         <select 
                           className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 h-12 text-sm font-bold text-slate-900 appearance-none cursor-pointer outline-none focus:border-emerald-500"
                           {...register('activePlacementBatch')}
                         >
                           <option>Batch 2025</option>
                           <option>Batch 2026</option>
                         </select>
                       </div>
                    </div>
                  </motion.div>
                )}

                {currentStep === 3 && (
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
                          className={`relative p-8 rounded-[32px] border-2 transition-all cursor-pointer ${
                            plan === 'basic' ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-100 bg-white hover:border-emerald-200 shadow-sm'
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
                          className={`relative p-8 rounded-[32px] border-2 transition-all cursor-pointer ${
                            plan === 'pro' ? 'border-[rgb(11,45,31)] bg-emerald-50/30' : 'border-slate-100 bg-white hover:border-emerald-200 shadow-sm'
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
                  </motion.div>
                )}

                {currentStep === 4 && (
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
                )}
              </AnimatePresence>

              {/* Navigation Buttons - Fixed at bottom */}
              {currentStep < 4 && (
                <div className="flex items-center justify-between pt-6 mt-10 border-t border-slate-100 flex-shrink-0">
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
                    className="px-10 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-[rgb(11,45,31)] text-white font-black shadow-xl shadow-emerald-900/10 hover:shadow-emerald-900/20 hover:scale-[1.02] transition-all flex items-center gap-2 border-none"
                  >
                    Continue <ArrowRight size={18} />
                  </Button>
                </div>
              )}
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
