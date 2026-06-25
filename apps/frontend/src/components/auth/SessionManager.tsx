'use client';
import { API_ROUTES } from '@/constants/api.routes';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { apiClient } from '@/services/api/api.client';
import { setStudentDetails } from '@/redux/slices/studentSlice';
import { setCollegeAdminDetails } from '@/redux/slices/collegeAdminSlice';
import { setHRDetails } from '@/redux/slices/hrSlice';
import { setInterviewerDetails } from '@/redux/slices/interviewerSlice';
import { getDashboardPath } from '@/utils/navigation';

// Routes accessible without authentication
const PUBLIC_ROUTES = [
  '/login',
  '/register',
  '/register-selection',
  '/',
  '/forgot-password',
  '/reset-password',
  '/admin/login',
  '/interviewer/setup',
  '/student/setup',
];

// Route prefixes that belong to specific roles
const PROTECTED_PREFIXES = ['/college', '/hr', '/student', '/admin', '/interviewer'];

function isPublicRoute(pathname: string): boolean {
  // Exact matches
  if (PUBLIC_ROUTES.includes(pathname)) return true;
  // Anything ending with /register (e.g. /college/register, /hr/register)
  if (pathname.endsWith('/register')) return true;
  // Public sub-paths
  if (pathname.startsWith('/public')) return true;
  // Student invitation / password setup flows
  if (pathname === '/student/setup' || pathname === '/student/verify' || pathname === '/interviewer/setup') return true;
  // Auth-specific login pages under role prefixes
  if (pathname.endsWith('/login')) return true;
  return false;
}

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export function SessionManager({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const { isAuthenticated, activeRole } = useAppSelector((state) => state.auth);
  const studentDetails = useAppSelector((state) => state.student.details);
  const hrDetails = useAppSelector((state) => state.hr.details);
  const collegeAdminDetails = useAppSelector((state) => state.collegeAdmin.details);
  const pathname = usePathname();
  const router = useRouter();

  // Track whether this is the initial client render.
  // On SSR / first paint, we don't know the auth state yet.
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // ── Status polling (blocked accounts, real-time updates) ──────────────────
  useEffect(() => {
    if (!isAuthenticated) return;

    const checkStatus = async () => {
      try {
        const response: any = await apiClient.get(API_ROUTES.AUTH.STATUS);

        if (response.data) {
          switch (activeRole) {
            case 'student':
              if (
                response.data &&
                (response.data.status !== studentDetails?.status ||
                  (response.data.proofUrl && !studentDetails?.proofUrl))
              ) {
                dispatch(setStudentDetails(response.data));
              }
              break;
            case 'college_admin':
              dispatch(setCollegeAdminDetails(response.data));
              break;
            case 'hr':
              dispatch(setHRDetails(response.data));
              break;
            case 'interviewer':
              dispatch(setInterviewerDetails(response.data));
              break;
          }
        }
      } catch (err: any) {
        const msg =
          err.response?.data?.error?.message || err.response?.data?.message || '';
        if (msg.toLowerCase().includes('blocked')) {
          window.location.href = '/login?error=blocked';
        }
      }
    };

    const intervalId = setInterval(checkStatus, 20000);
    checkStatus();
    window.addEventListener('focus', checkStatus);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', checkStatus);
    };
  }, [isAuthenticated]);

  // ── Route guard ───────────────────────────────────────────────────────────
  useEffect(() => {
    // Don't run the guard until redux-persist has finished rehydrating
    if (!isHydrated) return;

    const authRoutes = [
      '/login',
      '/register',
      '/register-selection',
      '/hr/register',
      '/college/register',
      '/interviewer/register',
      '/admin/login',
    ];

    const rolePrefixes: Record<string, string> = {
      student: '/student',
      hr: '/hr',
      interviewer: '/interviewer',
      college_admin: '/college',
      super_admin: '/admin',
    };

    // 1. Unauthenticated user trying to access a protected route → send to login
    if (!isAuthenticated && isProtectedRoute(pathname) && !isPublicRoute(pathname)) {
      router.replace('/login');
      return;
    }

    // 2. Authenticated user
    if (isAuthenticated && activeRole) {
      const hrOnboardingComplete =
        (hrDetails?.onboardingStep || 0) >= 3 ||
        hrDetails?.status?.toUpperCase() === 'ACTIVE';
      const collegeOnboardingComplete =
        (collegeAdminDetails?.onboardingStep || 0) >= 3 ||
        collegeAdminDetails?.status?.toUpperCase() === 'ACTIVE';

      // Prevent going back to onboarding if already completed
      if (activeRole === 'hr' && hrOnboardingComplete && pathname === '/hr/onboarding') {
        router.replace('/hr');
        return;
      }
      if (
        activeRole === 'college_admin' &&
        collegeOnboardingComplete &&
        pathname === '/college/onboarding'
      ) {
        router.replace('/college');
        return;
      }

      // Redirect away from auth / landing pages to the correct dashboard
      if (authRoutes.some((route) => pathname === route) || pathname === '/') {
        const isRegisterRoute = pathname.endsWith('/register');

        if (isRegisterRoute) {
          if (activeRole === 'hr' && !hrOnboardingComplete) {
            router.replace('/hr/onboarding');
            return;
          }
          if (activeRole === 'college_admin' && !collegeOnboardingComplete) {
            router.replace('/college/onboarding');
            return;
          }
        }

        router.replace(getDashboardPath(activeRole));
        return;
      }

      // Student-specific status routing
      if (activeRole === 'student' && studentDetails) {
        const status = studentDetails.status;
        const isWaitlistPage = pathname === '/student/waitlist';
        const isVerifyPage = pathname === '/student/verify';
        const isSetupPage = pathname === '/student/setup';

        if (status === 'ACTIVE') {
          if (isWaitlistPage || isVerifyPage || isSetupPage) {
            router.replace('/student');
          }
          return;
        }

        if (status === 'PENDING_VERIFICATION') {
          if (!studentDetails.proofUrl && !isVerifyPage && !isSetupPage) {
            router.replace('/student/verify');
            return;
          }
          if (studentDetails.proofUrl && !isWaitlistPage) {
            router.replace('/student/waitlist');
            return;
          }
          return;
        }

        if (status === 'REJECTED' && !isVerifyPage) {
          router.replace('/student/verify');
          return;
        }
      }

      // Prevent a user from accessing another role's routes
      const isSetupFlow =
        pathname === '/interviewer/setup' ||
        pathname === '/student/setup' ||
        pathname === '/student/verify' ||
        pathname === '/student/waitlist';

      const isAccessingOtherRolePath = Object.entries(rolePrefixes).some(
        ([role, prefix]) =>
          role !== activeRole && pathname.startsWith(prefix) && !isSetupFlow
      );

      if (isAccessingOtherRolePath) {
        router.replace(getDashboardPath(activeRole));
        return;
      }
    }
  }, [isAuthenticated, isHydrated, activeRole, pathname, router, hrDetails, collegeAdminDetails, studentDetails]);

  // ── Render ────────────────────────────────────────────────────────────────
  // While the store is rehydrating from localStorage, block rendering of
  // protected routes so users never see a flash of unauthenticated content.
  if (!isHydrated && isProtectedRoute(pathname) && !isPublicRoute(pathname)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
