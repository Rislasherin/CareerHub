'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Briefcase,
  UserCircle,
  Users,
  Building2,
  LogOut,
  GraduationCap,
  FileCheck,
  Bell,
  Plus,
  X,
  Megaphone,
  CreditCard,
  Calendar,
  Star,
  FileText,
  Target,
  BarChart3,
  Settings,
} from 'lucide-react';

import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { clearAuth } from '@/redux/slices/authSlice';
import { clearStudentDetails } from '@/redux/slices/studentSlice';
import { clearCollegeAdminDetails } from '@/redux/slices/collegeAdminSlice';
import { clearHRDetails } from '@/redux/slices/hrSlice';
import { clearInterviewerDetails } from '@/redux/slices/interviewerSlice';
import { clearSuperAdminDetails } from '@/redux/slices/superAdminSlice';
import { logoutUser } from '@/services/auth/auth.service';
import { motion, AnimatePresence } from 'framer-motion';
import { ConfirmModal } from '../shared/ConfirmModal';

interface NavItem {
  label: string;
  icon: any;
  href: string;
  badge?: string | number;
}

interface NavCategory {
  title: string;
  items: NavItem[];
}

const super_adminNav: NavCategory[] = [
  { title: 'OVERVIEW', items: [{ label: 'Dashboard', icon: LayoutDashboard, href: '/admin' }] },
  {
    title: 'MANAGEMENT',
    items: [
      { label: 'Colleges', icon: GraduationCap, href: '/admin/colleges' },
      { label: 'Companies', icon: Building2, href: '/admin/companies' },
      { label: 'Subscriptions', icon: CreditCard, href: '/admin/subscriptions' },
    ]
  },
  {
    title: 'FINANCE',
    items: [
      { label: 'Revenue', icon: BarChart3, href: '/admin/revenue' },
      { label: 'Billing & Invoices', icon: FileText, href: '/admin/billing' },
    ]
  },
  { title: 'PLATFORM', items: [{ label: 'Settings', icon: Settings, href: '/admin/settings' }] }
];

const collegeAdminNav: NavCategory[] = [
  { title: 'OVERVIEW', items: [{ label: 'Dashboard', icon: LayoutDashboard, href: '/college' }] },
  {
    title: 'MANAGEMENT',
    items: [
      { label: 'Student Directory', icon: Users, href: '/college/students' },
      { label: 'Notice Board', icon: Bell, href: '/college/notices' },
      { label: 'Plan & Billing', icon: CreditCard, href: '/college/subscription' }
    ]
  },
  {
    title: 'PLACEMENT',
    items: [
      { label: 'Drive Approvals', icon: FileCheck, href: '/college/jobs' },
      { label: 'Interview Tracker', icon: Calendar, href: '/college/interviews' },
      { label: 'Offer Letters', icon: FileText, href: '/college/offers' },
    ]
  },
  { 
    title: 'INSIGHTS', 
    items: [
      { label: 'Reports & Analytics', icon: BarChart3, href: '/college/reports' },
      { label: 'Placement Readiness', icon: Target, href: '/college/placement-readiness' }
    ] 
  },
  { title: 'ACCOUNT', items: [{ label: 'Settings', icon: Settings, href: '/college/settings' }] }
];

const hrNav: NavCategory[] = [
  {
    title: 'OVERVIEW',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, href: '/hr' },
      { label: 'Candidates', icon: Users, href: '/hr/candidates' },
    ]
  },
  {
    title: 'MANAGEMENT',
    items: [
      { label: 'Campus Drives', icon: Briefcase, href: '/hr/jobs' },
      { label: 'Post a Job', icon: Plus, href: '/hr/jobs?action=post-job' },
      { label: 'Interviews', icon: Calendar, href: '/hr/interviews' },
      { label: 'Hire Requests', icon: FileCheck, href: '/hr/hire-requests' },
      { label: 'Offer Letters', icon: FileText, href: '/hr/offers' },
    ]
  },
  { title: 'INSIGHTS', items: [{ label: 'Analytics', icon: BarChart3, href: '/hr/analytics' }] },
  { title: 'ACCOUNT', items: [{ label: 'Settings', icon: Settings, href: '/hr/settings' }] },
];

const studentNav: NavCategory[] = [
  {
    title: 'OVERVIEW',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, href: '/student' },
      { label: 'Jobs Feed', icon: Briefcase, href: '/student/jobs' },
      { label: 'My Profile', icon: UserCircle, href: '/student/profile' },
    ]
  },
  {
    title: 'CAREER',
    items: [
      { label: 'Notice Board', icon: Megaphone, href: '/student/notices' },
      { label: 'My Applications', icon: Calendar, href: '/student/applications' },
      { label: 'My Interviews', icon: Calendar, href: '/student/interviews' },
      { label: 'My Offers', icon: FileText, href: '/student/offers' },
    ]
  },
  {
    title: 'AI TOOLS',
    items: [
      { label: 'Resume Builder', icon: FileCheck, href: '/student/resume' },
      { label: 'Mock Interview', icon: Star, href: '/student/ai-practice' }
    ]
  },
];

const interviewerNav: NavCategory[] = [
  {
    title: 'NAVIGATION',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, href: '/interviewer' },
      { label: 'My Interviews', icon: Calendar, href: '/interviewer/interviews' },
    ]
  }
];

interface SidebarProps {
  onClose?: () => void;
  onLogoutRequest?: () => void;
  /**
   * Controls the mobile/tablet drawer state (below the `lg` breakpoint).
   * Has no effect at `lg` and above, where the sidebar is always docked and visible.
   * Defaults to true so the component still renders correctly if a parent
   * mounts it without wiring up open/close state.
   */
  isOpen?: boolean;
}

export const Sidebar = ({ onClose, onLogoutRequest, isOpen = true }: SidebarProps) => {
  const [isLogoutModalOpen, setIsLogoutModalOpen] = React.useState(false);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const dispatch = useAppDispatch();
  const { activeRole: role } = useAppSelector(state => state.auth);

  const studentDetails = useAppSelector(state => state.student.details);
  const collegeAdminDetails = useAppSelector(state => state.collegeAdmin.details);
  const hrDetails = useAppSelector(state => state.hr.details);
  const interviewerDetails = useAppSelector(state => state.interviewer.details);
  const superAdminDetails = useAppSelector(state => state.superAdmin.details);

  const user = studentDetails || collegeAdminDetails || hrDetails || interviewerDetails || superAdminDetails;
  const pathname = usePathname();

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

    const getSidebarStyles = () => {
    switch (role) {
      case 'super_admin':
        return { bg: 'bg-[#0B0D17]', accent: 'text-cyan-400', accentBg: 'bg-cyan-500/10', indicator: 'bg-cyan-500', logoBg: 'bg-cyan-500', logoGradient: 'from-cyan-500 to-cyan-700 shadow-cyan-500/30' };
      case 'hr':
        return { bg: 'bg-[#1b1430]', accent: 'text-indigo-300', accentBg: 'bg-indigo-500/10', indicator: 'bg-indigo-400', logoBg: 'bg-indigo-500', logoGradient: 'from-indigo-500 to-indigo-700 shadow-indigo-500/30' };
      case 'interviewer':
        return { bg: 'bg-[#0B0D17]', accent: 'text-sky-400', accentBg: 'bg-sky-500/10', indicator: 'bg-sky-500', logoBg: 'bg-sky-500', logoGradient: 'from-sky-500 to-sky-700 shadow-sky-500/30' };
      case 'college_admin':
        return { bg: 'bg-[#0B2D1F]', accent: 'text-emerald-400', accentBg: 'bg-emerald-500/10', indicator: 'bg-emerald-500', logoBg: 'bg-emerald-500', logoGradient: 'from-emerald-400 to-emerald-600 shadow-emerald-500/30' };
      case 'student':
        return { bg: 'bg-[#0B0D17]', accent: 'text-rose-500', accentBg: 'bg-rose-500/10', indicator: 'bg-rose-500', logoBg: 'bg-rose-500', logoGradient: 'from-rose-500 to-rose-700 shadow-rose-500/30' };
      default:
        return { bg: 'bg-slate-900', accent: 'text-indigo-400', accentBg: 'bg-indigo-500/10', indicator: 'bg-indigo-500', logoBg: 'bg-indigo-500', logoGradient: 'from-indigo-500 to-indigo-700 shadow-indigo-500/30' };
    }
  };

  const styles = getSidebarStyles();
  const sidebarBg = styles.bg;
  const accentColor = styles.accent;
  const accentBg = styles.accentBg;
  const activeIndicator = styles.indicator;
  const logoBg = styles.logoBg;

  const navigationMap: Record<string, NavCategory[]> = {
    student: studentNav,
    hr: hrNav,
    interviewer: interviewerNav,
    super_admin: super_adminNav,
    college_admin: collegeAdminNav
  };

  const currentNav = role ? navigationMap[role] : [];
  const isSuperAdmin = role === 'super_admin';

  return (
    <>
      {/* Mobile/tablet backdrop — only ever rendered below lg, and only while open */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="lg:hidden fixed inset-0 z-[55] bg-black/60 backdrop-blur-sm"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <aside
        className={`
          w-[82vw] max-w-[300px] sm:max-w-[320px] lg:w-80
          ${sidebarBg} h-screen h-[100dvh] flex flex-col fixed left-0 top-0 z-[60]
          border-r border-white/5
          transform transition-transform duration-300 ease-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden absolute top-5 right-5 w-9 h-9 flex items-center justify-center text-slate-500 hover:text-white bg-white/5 rounded-xl transition-all"
          >
            <X size={18} />
          </button>
        )}

        <div className="p-5 pb-4 sm:p-6 lg:p-8 lg:pb-4">
          <div className="flex items-center gap-3 mb-6 lg:mb-8 group cursor-pointer">
            <div className={`relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${styles.logoGradient} shadow-lg overflow-hidden shrink-0 group-hover:scale-105 group-hover:rotate-3 transition-all duration-300`}>
              <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px] group-hover:bg-transparent transition-all duration-300"></div>
              <Briefcase className="text-white z-10 w-5 h-5 relative right-[-2px] bottom-[-2px]" />
              <GraduationCap className="text-white/90 z-10 w-5 h-5 absolute top-1.5 left-1.5 -rotate-12" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-lg lg:text-xl font-black tracking-tighter leading-none truncate">
                <span className="text-white">Career</span>
                <span className={`text-transparent bg-clip-text bg-gradient-to-r ${styles.logoGradient}`}>Hub</span>
              </span>
              <span className={`text-[10px] font-bold ${accentColor} opacity-60 uppercase tracking-widest mt-1 truncate`}>
                {role === 'super_admin' ? 'Super Admin' :
                  role === 'hr' ? 'Company Portal' :
                    role === 'interviewer' ? 'Interviewer' :
                      role === 'college_admin' ? 'College Portal' : 'Student Portal'}
              </span>
            </div>
          </div>

          {role === 'student' && (
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 mb-6 lg:mb-8">
              <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-inner font-black text-sm uppercase">
                {studentDetails?.firstName ? `${studentDetails.firstName.charAt(0)}${studentDetails.lastName ? studentDetails.lastName.charAt(0) : ''}` : 'AS'}
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-sm font-black text-white truncate">
                  {studentDetails?.firstName ? `${studentDetails.firstName} ${studentDetails.lastName || ''}` : 'Student Account'}
                </span>
                <span className="text-[9px] font-bold text-slate-400 truncate mt-0.5">
                  {studentDetails?.rollNumber || '21CS001'} • {studentDetails?.branch || 'CS Engineering'}
                </span>
              </div>
              <div className="text-right shrink-0">
                <span className="text-rose-500 font-black text-xs block leading-none">{studentDetails?.cgpa || '9.1'}</span>
                <span className="text-[7px] font-bold text-slate-500 uppercase tracking-wider block mt-0.5">CGPA</span>
              </div>
            </div>
          )}

          {isSuperAdmin && (
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 mb-6 lg:mb-8">
              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center shrink-0 shadow-inner overflow-hidden border border-white/10">
                {user ? (
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.firstName || (user as any).name}`} alt="avatar" className="w-full h-full object-cover" />
                ) : <div className="text-[10px] font-black text-slate-500">SA</div>}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-black text-white truncate">{user ? (user.firstName ? `${user.firstName} ${user.lastName}` : (user as any).name) : 'Super Admin'}</span>
                <span className="text-[10px] font-bold text-slate-500 truncate">{user?.email || 'admin@careerhub.io'}</span>
              </div>
            </div>
          )}

          {role === 'college_admin' && (
            <div className="bg-white/5 rounded-2xl p-4 border border-white/5 mb-6 lg:mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-black text-white truncate max-w-[150px]">
                  {collegeAdminDetails?.collegeName || 'My Institution'}
                </span>
                <span className={`px-1.5 py-0.5 rounded-md ${accentBg} ${accentColor} text-[8px] font-black uppercase tracking-widest border border-white/5`}>PRO</span>
              </div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">AY {new Date().getFullYear()}-{new Date().getFullYear() + 1}</span>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar px-3 lg:px-4 pb-6 lg:pb-8">
          <div className="flex flex-col gap-6 lg:gap-8">
            {currentNav.map((category: NavCategory) => (
              <div key={category.title}>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3 lg:mb-4 px-4 block">{category.title}</span>
                <nav className="flex flex-col gap-1">
                  {category.items.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onClose}
                        className={`
                          flex items-center justify-between px-4 py-3 rounded-xl font-bold transition-all duration-300 group relative
                          ${isActive ? `${accentBg} ${accentColor}` : 'text-slate-400 hover:text-white hover:bg-white/5'}
                        `}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <item.icon size={18} className={`shrink-0 ${isActive ? accentColor : 'text-slate-500 group-hover:text-white transition-colors'}`} />
                          <span className="text-[13px] truncate">{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${isActive ? `${accentBg} ${accentColor}` : 'bg-white/5 text-slate-500 group-hover:text-slate-300'}`}>
                            {item.badge}
                          </span>
                        )}
                        {isActive && (
                          <motion.div
                            layoutId="active-indicator"
                            className={`absolute left-0 w-1 h-6 ${activeIndicator} rounded-r-full`}
                          />
                        )}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 mt-auto border-t border-white/5">
          {role === 'student' ? (
            <button
              onClick={() => {
                if (onLogoutRequest) onLogoutRequest();
                else setIsLogoutModalOpen(true);
              }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all group w-full"
            >
              <LogOut size={18} className="text-slate-500 group-hover:text-rose-500 rotate-180 shrink-0" />
              <span className="text-[13px]">Sign Out</span>
            </button>
          ) : !isSuperAdmin ? (
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 group hover:bg-white/10 transition-all cursor-pointer relative">
              <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center shrink-0 shadow-inner overflow-hidden border border-white/10">
                {user ? (
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.firstName || (user as any).name}`} alt="avatar" className="w-full h-full object-cover" />
                ) : <div className="text-[10px] font-black text-slate-500">?</div>}
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xs font-black text-white truncate">{user ? (user.firstName ? `${user.firstName} ${user.lastName}` : (user as any).name) : 'User Account'}</span>
                <span className="text-[9px] uppercase font-black text-slate-500 tracking-widest truncate">{role?.replace('_', ' ')}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (onLogoutRequest) onLogoutRequest();
                  else setIsLogoutModalOpen(true);
                }}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-all shrink-0"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                if (onLogoutRequest) onLogoutRequest();
                else setIsLogoutModalOpen(true);
              }}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-all group"
            >
              <div className="flex items-center gap-3">
                <LogOut size={18} className="text-slate-500 group-hover:text-red-400" />
                <span className="text-[13px]">Logout</span>
              </div>
            </button>
          )}

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
      </aside>
    </>
  );
};