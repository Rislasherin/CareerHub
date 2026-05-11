'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, MapPin, Phone, Mail, User, ArrowRight, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '@/components/shared/GlassCard';
import { Button } from '@/components/shared/Button';
import { Input } from '@/components/shared/Input';
import { Stepper } from '@/components/shared/Stepper';

const steps = [
  { title: 'Company', description: 'Business info' },
  { title: 'Details', description: 'Sector & Size' },
  { title: 'Contact', description: 'Primary contact' }
];

export default function HROnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    sector: '',
    size: '',
    location: '',
    contactName: '',
    contactEmail: '',
    contactPhone: ''
  });

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, steps.length));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < steps.length) {
      nextStep();
      return;
    }
    
    console.log('Completing HR Onboarding:', formData);
    // Simulate API call
    setTimeout(() => {
      router.push('/hr');
    }, 1500);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, field: string) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl"
      >
        <GlassCard className="p-10 shadow-2xl shadow-slate-200/50 border-none">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-black text-slate-900 mb-2">Company Onboarding</h1>
            <p className="text-slate-500 font-medium text-sm">Tell us more about your organization to get started</p>
          </div>

          <div className="mb-12">
            <Stepper steps={steps} currentStep={currentStep} roleType="hr" />
          </div>

          <form onSubmit={handleComplete} className="flex flex-col gap-8">
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-col gap-6"
                >
                  <Input 
                    label="Company Name" 
                    icon={<Building2 size={18} />} 
                    placeholder="e.g. Acme Corp"
                    value={formData.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e, 'name')}
                    required
                  />
                  <Input 
                    label="Headquarters Location" 
                    icon={<MapPin size={18} />} 
                    placeholder="e.g. Bangalore, India"
                    value={formData.location}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e, 'location')}
                    required
                  />
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div 
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-col gap-6"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Industry Sector</label>
                      <select 
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-sm font-medium appearance-none cursor-pointer"
                        value={formData.sector}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange(e, 'sector')}
                        required
                      >
                        <option value="">Select sector...</option>
                        <option value="it">Information Technology</option>
                        <option value="finance">Finance</option>
                        <option value="healthcare">Healthcare</option>
                        <option value="education">Education</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Company Size</label>
                      <select 
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-sm font-medium appearance-none cursor-pointer"
                        value={formData.size}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange(e, 'size')}
                        required
                      >
                        <option value="">Select size...</option>
                        <option value="startup">1-50 employees</option>
                        <option value="mid">51-200 employees</option>
                        <option value="large">201-1000 employees</option>
                        <option value="enterprise">1000+ employees</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div 
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-col gap-6"
                >
                  <Input 
                    label="Primary Contact Name" 
                    icon={<User size={18} />} 
                    placeholder="Full Name"
                    value={formData.contactName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e, 'contactName')}
                    required
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Input 
                      label="Contact Email" 
                      type="email"
                      icon={<Mail size={18} />} 
                      placeholder="hr@company.com"
                      value={formData.contactEmail}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e, 'contactEmail')}
                      required
                    />
                    <Input 
                      label="Contact Phone" 
                      icon={<Phone size={18} />} 
                      placeholder="+91..."
                      value={formData.contactPhone}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e, 'contactPhone')}
                      required
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
              {currentStep > 1 && (
                <Button type="button" variant="outline" onClick={prevStep} className="px-8 font-bold border-slate-200 hover:border-slate-900 transition-colors">
                  <ArrowLeft size={18} className="mr-2" /> Back
                </Button>
              )}
              <Button type="submit" roleType="hr" className={`flex-1 font-black ${currentStep === 1 ? 'w-full' : ''} bg-purple-600 hover:bg-purple-700`}>
                {currentStep === steps.length ? 'Finish Setup' : 'Continue'} 
                {currentStep < steps.length && <ArrowRight size={18} className="ml-2" />}
              </Button>
            </div>
          </form>
        </GlassCard>
      </motion.div>
    </div>
  );
}
