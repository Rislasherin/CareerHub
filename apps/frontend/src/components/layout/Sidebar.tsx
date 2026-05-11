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
  ShieldCheck, 
  LogOut,
  GraduationCap,
  FileCheck,
  Calendar
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const roleNavItems = {
  student: [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/student' },
    { label: 'Jobs', icon: Briefcase, href: '/student/jobs' },
    { label: 'Applications', icon: FileCheck, href: '/student/applications' },
    { label: 'Profile', icon: UserCircle, href: '/student/profile' },
  ],
  hr: [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/hr' },
    { label: 'Company Profile', icon: Building2, href: '/hr/profile' },
    { label: 'Interviewers', icon: Users, href: '/hr/interviewers' },
    { label: 'Job Postings', icon: Briefcase, href: '/hr/jobs' },
  ],
  college_admin: [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/college' },
    { label: 'Student Verification', icon: ShieldCheck, href: '/college/verification' },
    { label: 'All Students', icon: GraduationCap, href: '/college/students' },
  ],
  interviewer: [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/interviewer' },
    { label: 'Interviews', icon: Calendar, href: '/interviewer/schedule' },
  ],
  super_admin: [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
    { label: 'Organizations', icon: Building2, href: '/admin/organizations' },
    { label: 'Companies', icon: Briefcase, href: '/admin/companies' },
  ],
};

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  
  let role = user?.role;
  if (!role) {
    if (pathname.startsWith('/college')) role = 'college_admin';
    else if (pathname.startsWith('/hr')) role = 'hr';
    else if (pathname.startsWith('/interviewer')) role = 'interviewer';
    else if (pathname.startsWith('/admin')) role = 'super_admin';
    else role = 'student';
  }
  
  const navItems = roleNavItems[role as keyof typeof roleNavItems] || [];

  const getRoleActiveStyles = () => {
    switch (role) {
      case 'student': return 'bg-student-primary text-white shadow-lg shadow-student-primary/20';
      case 'hr': return 'bg-company-primary text-white shadow-lg shadow-company-primary/20';
      case 'college_admin': return 'bg-organizer-primary text-white shadow-lg shadow-organizer-primary/20';
      default: return 'bg-white/10 text-white shadow-lg';
    }
  };

  return (
    <aside className="w-72 bg-bg-sidebar min-h-screen flex flex-col p-6 fixed left-0 top-0 z-50">
      <div className="flex items-center gap-3 mb-12">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-lg">CH</div>
        <span className="text-xl font-extrabold text-white tracking-tight">CareerHub</span>
      </div>

      <nav className="flex-1 flex flex-col gap-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`
                flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all duration-200 group relative
                ${isActive ? getRoleActiveStyles() : 'text-slate-400 hover:text-white hover:bg-white/5'}
              `}
            >
              <item.icon size={20} className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-white transition-colors'} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="pt-6 border-t border-white/10 flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-white text-sm">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-white">{user?.firstName} {user?.lastName}</span>
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">{role?.replace('_', ' ')}</span>
          </div>
        </div>
        <button 
          onClick={logout} 
          className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-red-400 hover:bg-red-500/10 hover:text-red-500 transition-all duration-200"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};
