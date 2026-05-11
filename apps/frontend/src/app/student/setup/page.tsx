'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, FileText, ArrowRight, ArrowLeft, CheckCircle2, GraduationCap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '@/components/shared/GlassCard';
import { Button } from '@/components/shared/Button';
import { Input } from '@/components/shared/Input';
import { Stepper } from '@/components/shared/Stepper';

const steps = [
  { title: 'Security', description: 'Set password' },
  { title: 'Verification', description: 'Upload ID proof' }
];

export default function StudentSetupPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
    proofUrl: ''
  });

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, steps.length));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentStep === 1) {
      if (formData.password !== formData.confirmPassword) {
        alert("Passwords don't match");
        return;
      }
      nextStep();
      return;
    }
    
    // Final Step - API Call
    console.log('Activating Student Account:', formData);
    setIsSuccess(true);
    setTimeout(() => {
      router.push('/login');
    }, 3000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.05),transparent)]">
      <GlassCard className="max-w-[500px] w-full p-10">
        <AnimatePresence mode="wait">
          {!isSuccess ? (
            <motion.div
              key="setup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="text-center mb-10">
                <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <GraduationCap size={28} />
                </div>
                <h1 className="text-3xl font-black text-slate-900 mb-2">Account Setup</h1>
                <p className="text-slate-500 text-sm font-medium">Complete your profile to activate your student account.</p>
              </div>

              <div className="mb-10">
                <Stepper steps={steps} currentStep={currentStep} roleType="student" />
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
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
                        label="New Password" 
                        type="password"
                        icon={<Lock size={18} />} 
                        placeholder="Create a strong password"
                        value={formData.password}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e, 'password')}
                        required 
                      />
                      <Input 
                        label="Confirm Password" 
                        type="password"
                        icon={<Lock size={18} />} 
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e, 'confirmPassword')}
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
                      <Input 
                        label="College ID Proof (URL)" 
                        icon={<FileText size={18} />} 
                        placeholder="Link to your student ID"
                        value={formData.proofUrl}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e, 'proofUrl')}
                        required 
                      />
                      <div className="p-4 bg-sky-50 rounded-2xl border border-sky-100">
                        <p className="text-xs font-medium text-sky-700 leading-relaxed">
                          <strong className="font-black">Note:</strong> After submitting, your college admin will review your proof. You can login once verified.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex items-center gap-4 pt-4">
                  {currentStep > 1 && (
                    <Button type="button" variant="outline" onClick={prevStep} className="px-6 font-bold border-slate-200 hover:border-slate-900 transition-colors">
                      <ArrowLeft size={18} />
                    </Button>
                  )}
                  <Button type="submit" roleType="student" className="flex-1 font-black bg-sky-600 hover:bg-sky-700">
                    {currentStep === steps.length ? 'Submit for Verification' : 'Continue'} 
                    {currentStep < steps.length && <ArrowRight size={18} className="ml-2" />}
                  </Button>
                </div>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-10"
            >
              <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={48} />
              </div>
              <h2 className="text-3xl font-black text-slate-900 mb-4">Setup Complete!</h2>
              <p className="text-slate-500 font-medium leading-relaxed">
                Your account is now pending verification from your college admin. We will redirect you shortly.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>
    </div>
  );
}
