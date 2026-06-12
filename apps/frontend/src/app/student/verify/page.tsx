'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileUp,
  ShieldCheck,
  AlertCircle,
  LogOut,
  ArrowRight,
  Clock,
  ShieldQuestion,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/shared/Button';
import { apiClient } from '@/services/api/api.client';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { clearAuth } from '@/redux/slices/authSlice';
import { clearStudentDetails, setStudentDetails, StudentDetails } from '@/redux/slices/studentSlice';
import { clearCollegeAdminDetails } from '@/redux/slices/collegeAdminSlice';
import { clearHRDetails } from '@/redux/slices/hrSlice';
import { clearInterviewerDetails } from '@/redux/slices/interviewerSlice';
import { clearSuperAdminDetails } from '@/redux/slices/superAdminSlice';
import { logoutUser } from '@/services/auth/auth.service';

export default function StudentVerifyPage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.student.details);
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isReuploading, setIsReuploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    setIsLoading(true);
    try {
      const response: type = await apiClient.post('/student/verify', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Update local state with new status (PENDING_VERIFICATION)
      if (response.data) {
        dispatch(setStudentDetails(response.data));
      } else if (user) {
        // Fallback: manually update status in Redux if response doesn't return full user
        const updatedUser = {
          ...user,
          status: 'PENDING_VERIFICATION',
          proofUrl: 'uploaded'
        } as StudentDetails;
        dispatch(setStudentDetails(updatedUser));
      }

      toast.success('Verification proof uploaded successfully!');
      setIsReuploading(false);
      router.push('/student/waitlist');
    } catch (err: type) {
      // toast handled by interceptor
    } finally {
      setIsLoading(false);
    }
  };

  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && (file.type.startsWith('image/') || file.type === 'application/pdf')) {
      setSelectedFile(file);
      toast.success(`Selected file: ${file.name}`);
    } else if (file) {
      toast.error('Invalid file format. Please upload PDF, JPG, or PNG.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch { }

    // Clear Redux
    dispatch(clearAuth());
    dispatch(clearStudentDetails());
    dispatch(clearCollegeAdminDetails());
    dispatch(clearHRDetails());
    dispatch(clearInterviewerDetails());
    dispatch(clearSuperAdminDetails());

    router.push('/login?role=student');
  };


  if (user?.status === 'REJECTED' && !isReuploading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-12 text-center border border-slate-100"
        >
          <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mb-8 mx-auto shadow-sm">
            <AlertCircle size={40} strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-4 tracking-tighter">
            Verification Rejected
          </h1>
          <p className="text-slate-500 font-medium mb-8 leading-relaxed">
            Your recent document submission was not approved by the college administration.
          </p>
          <div className="p-6 bg-rose-50/50 rounded-2xl border border-rose-100 text-left mb-8">
            <div className="flex items-center gap-2 text-[10px] font-black text-rose-600 uppercase tracking-widest mb-2">
              <AlertCircle size={14} />
              Reason for rejection
            </div>
            <p className="text-slate-700 font-bold text-sm leading-relaxed">
              {user?.rejectReason || 'The uploaded document was unclear or invalid. Please provide a high-quality scan of your current college ID card.'}
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Button
              fullWidth
              onClick={() => setIsReuploading(true)}
              className="h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-xs rounded-2xl transition-all border-none shadow-lg shadow-indigo-500/20"
            >
              Update & Re-upload
            </Button>
            <Button
              fullWidth
              onClick={handleLogout}
              variant="outline"
              className="h-14 border-slate-200 text-slate-600 font-black uppercase tracking-widest text-xs rounded-2xl transition-all hover:bg-slate-50"
            >
              Logout
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="h-24 bg-white border-b border-slate-100 flex items-center justify-between px-8 lg:px-12 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black">CH</div>
          <span className="text-xl font-black tracking-tighter">CareerHub Student</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-slate-500 hover:text-rose-600 font-bold text-sm transition-colors"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto p-8 lg:p-12 grid grid-cols-1 lg:grid-cols-5 gap-12">

        {/* Left: Progress & Info */}
        <div className="lg:col-span-2 space-y-8">
          <div className="p-8 bg-indigo-600 rounded-[2.5rem] text-white shadow-xl shadow-indigo-500/20">
            <h2 className="text-2xl font-black mb-4 tracking-tighter">Identity Verification</h2>
            <p className="text-indigo-100 font-medium mb-8 leading-relaxed">
              We need to confirm you are a verified student of your institution before granting full access to the placement portal.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-3 bg-white/10 p-4 rounded-2xl border border-white/10">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-white font-bold text-xs">1</div>
                <span className="text-sm font-bold">Invite Accepted</span>
                <CheckCircle2 size={16} className="ml-auto text-indigo-300" />
              </div>
              <div className="flex items-center gap-3 bg-white p-4 rounded-2xl shadow-lg shadow-indigo-700/20 text-indigo-700">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">2</div>
                <span className="text-sm font-black">Upload ID Proof</span>
                <ArrowRight size={16} className="ml-auto animate-pulse" />
              </div>
              <div className="flex items-center gap-3 bg-white/10 p-4 rounded-2xl border border-white/10 opacity-50">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-white font-bold text-xs">3</div>
                <span className="text-sm font-bold">Admin Review</span>
              </div>
            </div>
          </div>

          <div className="p-8 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 text-slate-900 font-black mb-4 uppercase tracking-widest text-[10px]">
              <ShieldQuestion size={16} className="text-indigo-500" />
              Security Notice
            </div>
            <p className="text-slate-500 text-sm font-medium leading-relaxed">
              Your uploaded ID will only be visible to your college placement cell for verification purposes. We never share your personal documents with third-party employers.
            </p>
          </div>
        </div>

        {/* Right: Upload Form */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 p-10 lg:p-14 border border-slate-50">
            <h3 className="text-3xl font-black text-slate-900 mb-8 tracking-tighter">Upload College ID</h3>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*,.pdf"
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-[2rem] p-12 text-center transition-all cursor-pointer group
                    ${selectedFile ? 'border-emerald-400 bg-emerald-50/30' :
                      isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30'}
                  `}
                >
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto transition-all
                    ${selectedFile ? 'bg-emerald-100 text-emerald-600 scale-110' :
                      isDragging ? 'bg-indigo-200 text-indigo-700 scale-110' : 'bg-slate-50 text-slate-400 group-hover:scale-110 group-hover:bg-indigo-100 group-hover:text-indigo-600'}
                  `}>
                    {selectedFile ? <CheckCircle2 size={32} /> : <FileUp size={32} />}
                  </div>
                  <p className="text-slate-900 font-black mb-2 tracking-tight">
                    {selectedFile ? selectedFile.name : isDragging ? 'Drop file to upload' : 'Drag & drop your ID proof here'}
                  </p>
                  <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">
                    {selectedFile ? 'File ready to submit' : 'Supports PDF, JPG, or PNG (Max 5MB)'}
                  </p>
                </div>

                <div className="bg-amber-50 rounded-2xl p-6 flex gap-4 border border-amber-100">
                  <AlertCircle className="text-amber-500 shrink-0" size={24} />
                  <div>
                    <h4 className="text-amber-900 font-bold text-sm mb-1">Important Requirements</h4>
                    <ul className="text-amber-800/70 text-xs font-medium list-disc ml-4 space-y-1 leading-relaxed">
                      <li>Name on ID must match your profile name</li>
                      <li>Roll number must be clearly visible</li>
                      <li>ID card must be valid for the current academic year</li>
                    </ul>
                  </div>
                </div>
              </div>


              <Button
                type="submit"
                fullWidth
                isLoading={isLoading}
                className="h-16 bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-slate-900/20 active:scale-[0.98] transition-all border-none"
              >
                Submit for Verification
              </Button>
            </form>
          </div>
        </div>

      </main>
    </div>
  );
}
