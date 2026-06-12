'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Clock,
  LogOut,
  ArrowRight,
  ShieldQuestion,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/shared/Button';
import { apiClient } from '@/services/api/api.client';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { clearAuth } from '@/redux/slices/authSlice';
import { clearStudentDetails, setStudentDetails } from '@/redux/slices/studentSlice';
import { logoutUser } from '@/services/auth/auth.service';
import { clearCollegeAdminDetails } from '@/redux/slices/collegeAdminSlice';
import { clearHRDetails } from '@/redux/slices/hrSlice';
import { clearInterviewerDetails } from '@/redux/slices/interviewerSlice';
import { clearSuperAdminDetails } from '@/redux/slices/superAdminSlice';

export default function StudentWaitlistPage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.student.details);
  const router = useRouter();

  useEffect(() => {
    // If already active or rejected, route immediately
    if (user?.status === 'ACTIVE') {
      router.push('/student');
      return;
    } else if (user?.status === 'REJECTED') {
      router.push('/student/verify');
      return;
    }

    const checkStatus = async () => {
      try {
        const response: type = await apiClient.get('/auth/student/me');
        if (response.success && response.data) {
          const updatedUser = response.data;
          dispatch(setStudentDetails(updatedUser));
          if (updatedUser.status === 'ACTIVE') {
            router.push('/student');
          } else if (updatedUser.status === 'REJECTED') {
            router.push('/student/verify');
          }
        }
      } catch (err) {
        console.error('Failed to poll status', err);
      }
    };

    // Check once on mount in case it changed
    checkStatus();

    const interval = setInterval(checkStatus, 15000);
    return () => clearInterval(interval);
  }, [user?.status, router, dispatch]);

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch { }

    dispatch(clearAuth());
    dispatch(clearStudentDetails());
    dispatch(clearCollegeAdminDetails());
    dispatch(clearHRDetails());
    dispatch(clearInterviewerDetails());
    dispatch(clearSuperAdminDetails());

    router.push('/login?role=student');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-12 text-center border border-slate-100"
      >
        <div className="w-24 h-24 bg-amber-50 text-amber-500 rounded-[2rem] flex items-center justify-center mb-10 mx-auto shadow-sm">
          <Clock size={48} strokeWidth={2.5} className="animate-pulse" />
        </div>

        <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter">Under Review</h1>
        <p className="text-slate-500 font-medium mb-10 leading-relaxed">
          Your documents have been submitted and are currently being reviewed by your college administration.
          <br /><br />
          We'll notify you via email once your account is activated.
        </p>

        <div className="space-y-6">
          <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 text-left">
            <div className="flex items-center gap-3 text-slate-900 font-black mb-2 uppercase tracking-widest text-[10px]">
              <ShieldQuestion size={16} className="text-amber-500" />
              What's next?
            </div>
            <p className="text-slate-500 text-xs font-medium leading-relaxed">
              Once approved, you'll get full access to job applications, assessments, and placement tools.
            </p>
          </div>

          <Button
            fullWidth
            onClick={handleLogout}
            variant="outline"
            className="h-16 border-slate-200 text-slate-600 font-black uppercase tracking-widest text-xs rounded-2xl transition-all hover:bg-slate-50"
          >
            <LogOut size={18} className="mr-2" /> Logout for Now
          </Button>
        </div>

        <div className="mt-10 flex items-center justify-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
          <AlertCircle size={14} />
          Checked every 15 seconds
        </div>
      </motion.div>
    </div>
  );
}
