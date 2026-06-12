'use client';

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { LogOut, User as UserIcon, Menu, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { clearAuth } from '@/redux/slices/authSlice';
import { clearStudentDetails } from '@/redux/slices/studentSlice';
import { clearCollegeAdminDetails } from '@/redux/slices/collegeAdminSlice';
import { clearHRDetails } from '@/redux/slices/hrSlice';
import { clearInterviewerDetails } from '@/redux/slices/interviewerSlice';
import { clearSuperAdminDetails } from '@/redux/slices/superAdminSlice';
import { logoutUser } from '@/services/auth/auth.service';
import { ConfirmModal } from '../shared/ConfirmModal';
import { motion, AnimatePresence } from 'framer-motion';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
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
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[55] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar - Desktop (Fixed) & Mobile (Drawer) */}
      <div className={`
        fixed inset-y-0 left-0 z-[60] transform transition-transform duration-300 lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar
          onClose={() => setIsSidebarOpen(false)}
          onLogoutRequest={() => setIsLogoutModalOpen(true)}
        />
      </div>

      <div className={`flex-1 flex flex-col min-h-screen max-w-full overflow-hidden ${!isSidebarOpen ? 'lg:pl-80' : 'lg:pl-80'}`}>
        {/* Top Header */}
        {!isSuperAdmin && (
          <header className={`px-6 lg:px-10 flex items-center justify-between bg-white border-b border-slate-100 sticky top-0 z-50 ${role === 'student' ? 'lg:hidden h-16' : 'h-20'
            }`}>
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden w-10 h-10 flex items-center justify-center text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
            >
              <Menu size={24} />
            </button>

            {role === 'student' && <span className="font-black text-slate-800 text-sm lg:hidden absolute left-1/2 -translate-x-1/2">CareerHub</span>}

            <div className={`items-center gap-6 ml-auto ${role === 'student' ? 'hidden' : 'flex'}`}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 overflow-hidden">
                  {user ? (
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.firstName || (user as type).collegeName || 'User'}`} alt="avatar" className="w-full h-full object-cover" />
                  ) : <UserIcon size={18} />}
                </div>
                <div className="hidden sm:flex flex-col">
                  <span className="text-xs font-black text-slate-900 truncate max-w-[120px]">
                    {user ? (user.firstName ? `${user.firstName} ${user.lastName}` : (user as type).collegeName) : 'Account'}
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
          {children}
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
