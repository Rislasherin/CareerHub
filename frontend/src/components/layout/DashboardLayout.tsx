'use client';

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { NotificationBell } from '../shared/NotificationBell';
import { useRouter } from 'next/navigation';
import { LogOut, User as UserIcon, Menu, X, Clock, ShieldCheck, AlertTriangle, XCircle, FileEdit } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { clearAuth } from '@/redux/slices/authSlice';
import { clearStudentDetails } from '@/redux/slices/studentSlice';
import { clearCollegeAdminDetails } from '@/redux/slices/collegeAdminSlice';
import { clearHRDetails } from '@/redux/slices/hrSlice';
import { clearInterviewerDetails } from '@/redux/slices/interviewerSlice';
import { clearSuperAdminDetails } from '@/redux/slices/superAdminSlice';
import { logoutUser } from '@/services/auth/auth.service';
import { ConfirmModal } from '../shared/ConfirmModal';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const router = useRouter();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const dispatch = useAppDispatch();
  const { activeRole: role } = useAppSelector(state => state.auth);

  const studentDetails = useAppSelector(state => state.student.details);
  const collegeAdminDetails = useAppSelector(state => state.collegeAdmin.details);
  const hrDetails = useAppSelector(state => state.hr.details);
  const interviewerDetails = useAppSelector(state => state.interviewer.details);
  const superAdminDetails = useAppSelector(state => state.superAdmin.details);

  const user = studentDetails || collegeAdminDetails || hrDetails || interviewerDetails || superAdminDetails;

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logoutUser();
    } catch { }

    dispatch(clearAuth());
    dispatch(clearStudentDetails());
    dispatch(clearCollegeAdminDetails());
    dispatch(clearHRDetails());
    dispatch(clearInterviewerDetails());
    dispatch(clearSuperAdminDetails());

    window.location.href = '/login';
  };

  const isSuperAdmin = role === 'super_admin';

  return (
    <div className={`flex min-h-screen ${isSuperAdmin ? 'bg-[#0B0D17]' : 'bg-slate-50'} selection:bg-cyan-500/30 relative`}>
      {/*
        FIX: Sidebar is now the single owner of the mobile drawer's fixed
        positioning, transform, and backdrop. We only pass it `isOpen` and
        let it render itself — no duplicate wrapper/backdrop here anymore.
      */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onLogoutRequest={() => setIsLogoutModalOpen(true)}
      />

      {/*
        FIX: this used to be `${!isSidebarOpen ? 'lg:pl-80' : 'lg:pl-80'}`,
        a ternary where both branches were identical (always 'lg:pl-80').
        lg:pl-80 only matters at the desktop breakpoint, where the sidebar
        is permanently docked — it should never depend on mobile drawer state.
      */}
      <div className="flex-1 flex flex-col min-h-screen max-w-full overflow-hidden lg:pl-80">
        {/* Top Header */}
        {!isSuperAdmin && (
          <header className={`px-6 lg:px-10 flex items-center justify-between bg-white border-b border-slate-100 sticky top-0 z-50 h-16 lg:h-20`}>
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden w-10 h-10 flex items-center justify-center text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
            >
              <Menu size={24} />
            </button>

            {role === 'student' && (
              <span className="font-black text-sm lg:hidden absolute left-1/2 -translate-x-1/2 tracking-tighter flex items-center">
                <span className="text-slate-800">Career</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">Hub</span>
              </span>
            )}

            <div className="items-center gap-3 ml-auto flex">
              {role && (
                <NotificationBell role={role as 'student' | 'hr' | 'interviewer' | 'college_admin' | 'super_admin'} />
              )}

              <div className="w-px h-6 bg-slate-100 hidden sm:block"></div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 overflow-hidden">
                  {user ? (
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.firstName || (user as { collegeName?: string }).collegeName || 'User'}`} alt="avatar" className="w-full h-full object-cover" />
                  ) : <UserIcon size={18} />}
                </div>
                <div className="hidden sm:flex flex-col">
                  <span className="text-xs font-black text-slate-900 truncate max-w-[120px]">
                    {user ? (user.firstName ? `${user.firstName} ${user.lastName}` : (user as { collegeName?: string }).collegeName) : 'Account'}
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{role?.replace('_', ' ')}</span>
                </div>
              </div>

              <div className="w-px h-6 bg-slate-100 hidden sm:block"></div>

              <button
                onClick={() => setIsLogoutModalOpen(true)}
                className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-red-500 transition-all uppercase tracking-widest"
              >
                <LogOut size={14} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </header>
        )}

        {isSuperAdmin && (
          <div className="lg:hidden p-4 flex items-center bg-[#0B0D17] border-b border-white/5">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white bg-white/5 rounded-xl transition-all"
            >
              <Menu size={24} />
            </button>
          </div>
        )}

        <main className="p-6 lg:p-10 flex-1 overflow-x-hidden overflow-y-auto">
          {((role === 'hr' && hrDetails?.status === 'PENDING' && (hrDetails?.onboardingStep ?? 0) >= 3) ||
            (role === 'college_admin' && (collegeAdminDetails as any)?.status === 'PENDING' && ((collegeAdminDetails as any)?.onboardingStep ?? 0) >= 3)) ? (
            <div className="flex flex-col items-center justify-center h-full py-20 text-center space-y-6">
              <div className="w-24 h-24 bg-amber-50 rounded-[2rem] flex items-center justify-center text-amber-500 shadow-inner">
                <Clock size={48} strokeWidth={1.5} />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Pending Administrator Approval</h2>
                <p className="text-slate-500 font-medium max-w-md mx-auto">
                  Your account is currently under review by our administrators. You will be able to access all features once your account is verified and approved.
                </p>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-sm w-full shadow-sm mt-4">
                <div className="flex items-center gap-4 text-left">
                  <ShieldCheck size={24} className="text-indigo-600 shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Verification Process</h4>
                    <p className="text-xs text-slate-500 mt-1">Usually takes 1-2 business days. We will notify you via email once approved.</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (role === 'college_admin' && (collegeAdminDetails as any)?.status === 'REJECTED') ? (
            <div className="flex flex-col items-center justify-center min-h-[70vh] py-12 text-center space-y-6 max-w-2xl mx-auto">
              <div className="w-20 h-20 bg-rose-50 rounded-[2rem] flex items-center justify-center text-rose-500 shadow-inner border border-rose-100">
                <XCircle size={44} strokeWidth={1.8} />
              </div>

              <div className="space-y-2">
                <div className="flex justify-center mb-1">
                  <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-rose-50 text-rose-600 border border-rose-200">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    Application Rejected
                  </span>
                </div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Application Requires Changes</h2>
                <p className="text-slate-500 font-medium max-w-lg mx-auto text-sm leading-relaxed">
                  Your institution application was reviewed by our administrators and requires corrections before it can be approved. Please review the feedback below, make the necessary changes, and resubmit for review.
                </p>
              </div>

              {/* Rejection Reason Card */}
              <div className="bg-gradient-to-br from-rose-50/70 to-red-50/40 border border-rose-200/80 rounded-2xl p-6 w-full text-left shadow-sm">
                <div className="flex items-start gap-3">
                  <AlertTriangle size={20} className="text-rose-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-xs font-black text-rose-950 uppercase tracking-wider">Administrator Feedback</h4>
                    <p className="text-sm text-rose-900 font-medium mt-1 leading-relaxed bg-white/70 p-3.5 rounded-xl border border-rose-100">
                      {(collegeAdminDetails as any)?.rejectionReason || 'No specific feedback provided. Please review and update your institution submission details.'}
                    </p>
                    {(collegeAdminDetails as any)?.rejectedAt && (
                      <p className="text-[11px] text-rose-500 font-bold mt-2">
                        Reviewed on {new Date((collegeAdminDetails as any).rejectedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Submitted Details Snapshot */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full text-left shadow-sm space-y-4">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Submitted Institution Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="font-medium text-slate-400">Institution Name:</span>
                    <p className="font-bold text-slate-800 text-sm mt-0.5">{(collegeAdminDetails as any)?.collegeName || (collegeAdminDetails as any)?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-slate-400">Contact Email:</span>
                    <p className="font-bold text-slate-800 text-sm mt-0.5">{(collegeAdminDetails as any)?.placementContactEmail || collegeAdminDetails?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-slate-400">Location:</span>
                    <p className="font-bold text-slate-800 text-sm mt-0.5">{[(collegeAdminDetails as any)?.city, (collegeAdminDetails as any)?.state].filter(Boolean).join(', ') || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-slate-400">Active Branches:</span>
                    <p className="font-bold text-slate-800 text-sm mt-0.5">{collegeAdminDetails?.activeBranches?.length ? collegeAdminDetails.activeBranches.join(', ') : 'None specified'}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full pt-2">
                <button
                  onClick={() => router.push('/college/onboarding?mode=edit')}
                  className="w-full sm:flex-1 h-12 rounded-xl bg-gradient-to-r from-emerald-600 to-[rgb(11,45,31)] hover:opacity-95 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/10 transition-all cursor-pointer"
                >
                  <FileEdit size={16} /> Edit and Resubmit Form
                </button>
                <button
                  onClick={() => setIsLogoutModalOpen(true)}
                  className="w-full sm:w-auto px-6 h-12 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-bold text-sm transition-all"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (role === 'hr' && (hrDetails as any)?.status === 'REJECTED') ? (
            <div className="flex flex-col items-center justify-center min-h-[70vh] py-12 text-center space-y-6 max-w-2xl mx-auto">
              <div className="w-20 h-20 bg-rose-50 rounded-[2rem] flex items-center justify-center text-rose-500 shadow-inner border border-rose-100">
                <XCircle size={44} strokeWidth={1.8} />
              </div>

              <div className="space-y-2">
                <div className="flex justify-center mb-1">
                  <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-rose-50 text-rose-600 border border-rose-200">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    Application Rejected
                  </span>
                </div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Application Requires Changes</h2>
                <p className="text-slate-500 font-medium max-w-lg mx-auto text-sm leading-relaxed">
                  Your company application was reviewed by our administrators and requires corrections before it can be approved. Please review the feedback below, make the necessary changes, and resubmit for review.
                </p>
              </div>

              {/* Rejection Reason Card */}
              <div className="bg-gradient-to-br from-rose-50/70 to-red-50/40 border border-rose-200/80 rounded-2xl p-6 w-full text-left shadow-sm">
                <div className="flex items-start gap-3">
                  <AlertTriangle size={20} className="text-rose-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-xs font-black text-rose-950 uppercase tracking-wider">Administrator Feedback</h4>
                    <p className="text-sm text-rose-900 font-medium mt-1 leading-relaxed bg-white/70 p-3.5 rounded-xl border border-rose-100">
                      {(hrDetails as any)?.rejectionReason || 'No specific feedback provided. Please review and update your company submission details.'}
                    </p>
                    {(hrDetails as any)?.rejectedAt && (
                      <p className="text-[11px] text-rose-500 font-bold mt-2">
                        Reviewed on {new Date((hrDetails as any).rejectedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Submitted Details Snapshot */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full text-left shadow-sm space-y-4">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Submitted Company Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="font-medium text-slate-400">Company Name:</span>
                    <p className="font-bold text-slate-800 text-sm mt-0.5">{(hrDetails as any)?.companyName || (hrDetails as any)?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-slate-400">Contact Person:</span>
                    <p className="font-bold text-slate-800 text-sm mt-0.5">{[(hrDetails as any)?.firstName, (hrDetails as any)?.lastName].filter(Boolean).join(' ') || (hrDetails as any)?.contactName || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-slate-400">Contact Email:</span>
                    <p className="font-bold text-slate-800 text-sm mt-0.5">{(hrDetails as any)?.contactEmail || hrDetails?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-slate-400">Industry:</span>
                    <p className="font-bold text-slate-800 text-sm mt-0.5">{(hrDetails as any)?.industry || (hrDetails as any)?.sector || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-slate-400">Headquarters / Location:</span>
                    <p className="font-bold text-slate-800 text-sm mt-0.5">{(hrDetails as any)?.headquarters || (hrDetails as any)?.location || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-slate-400">Company Size:</span>
                    <p className="font-bold text-slate-800 text-sm mt-0.5">{(hrDetails as any)?.size || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full pt-2">
                <button
                  onClick={() => router.push('/hr/onboarding?mode=edit')}
                  className="w-full sm:flex-1 h-12 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:opacity-95 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/10 transition-all cursor-pointer"
                >
                  <FileEdit size={16} /> Edit and Resubmit Form
                </button>
                <button
                  onClick={() => setIsLogoutModalOpen(true)}
                  className="w-full sm:w-auto px-6 h-12 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-bold text-sm transition-all"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            children
          )}
        </main>

        <ConfirmModal
          isOpen={isLogoutModalOpen}
          onClose={() => setIsLogoutModalOpen(false)}
          onConfirm={handleLogout}
          isLoading={isLoggingOut}
          title="Sign Out"
          message="Are you sure you want to log out?"
          confirmText="Sign Out"
          type="danger"
        />
      </div>
    </div>
  );
};