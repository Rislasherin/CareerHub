'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { apiClient } from '@/services/api/api.client';
import { setStudentDetails } from '@/redux/slices/studentSlice';
import { setCollegeAdminDetails } from '@/redux/slices/collegeAdminSlice';
import { setHRDetails } from '@/redux/slices/hrSlice';
import { setInterviewerDetails } from '@/redux/slices/interviewerSlice';
import { getDashboardPath } from '@/utils/navigation';

export function SessionManager({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const { isAuthenticated, activeRole } = useAppSelector((state) => state.auth);
  const studentDetails = useAppSelector((state) => state.student.details);
  const hrDetails = useAppSelector((state) => state.hr.details);
  const collegeAdminDetails = useAppSelector((state) => state.collegeAdmin.details);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) return;

    // Periodically check account status to handle administrative blocking
    const checkStatus = async () => {
      try {
        const response: any = await apiClient.get('/auth/status');

        // Update Redux state with latest user data (handles real-time approvals)
        if (response.data) {
          switch (activeRole) {
            case 'student':
              // Only update if we have new data and avoid overwriting a valid proofUrl with null
              if (response.data && (response.data.status !== studentDetails?.status || (response.data.proofUrl && !studentDetails?.proofUrl))) {
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
        const msg = err.response?.data?.error?.message || err.response?.data?.message || '';
        if (msg.toLowerCase().includes('blocked')) {
          // Force immediate logout and redirect
          window.location.href = '/login?error=blocked';
        }
      }
    };

    const intervalId = setInterval(checkStatus, 20000); // Check every 20 seconds

    // Initial check
    checkStatus();

    // Also check on window focus
    window.addEventListener('focus', checkStatus);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', checkStatus);
    };
  }, [isAuthenticated]);

  useEffect(() => {
    const publicRoutes = ['/login', '/register', '/register-selection', '/', '/forgot-password', '/reset-password', '/admin/login', '/interviewer/setup', '/student/setup'];
    const authRoutes = ['/login', '/register', '/register-selection', '/hr/register', '/college/register', '/interviewer/register', '/admin/login'];

    // 1. If NOT logged in and trying to access a protected route
    const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith('/public')) || pathname.endsWith('/register') || pathname === '/interviewer/setup' || pathname === '/student/setup';

    if (!isAuthenticated && !isPublicRoute) {
      router.replace('/login');
      return;
    }

    // 2. If logged in
    if (isAuthenticated && activeRole) {
      // Role-to-path prefix mapping
      const rolePrefixes: Record<string, string> = {
        student: '/student',
        hr: '/hr',
        interviewer: '/interviewer',
        college_admin: '/college',
        super_admin: '/admin',
      };

      // 3. Onboarding Redirection Logic
      const hrOnboardingComplete = (hrDetails?.onboardingStep || 0) >= 3;
      const collegeOnboardingComplete = (collegeAdminDetails?.onboardingStep || 0) >= 3;

      // Handle auth route redirects (Login/Register -> Dashboard)
      if (authRoutes.some(route => pathname === route) || pathname === '/') {
        router.replace(getDashboardPath(activeRole));
        return;
      }

      // Prevent going back to onboarding if already completed
      if (activeRole === 'hr' && hrOnboardingComplete && pathname === '/hr/onboarding') {
        router.replace('/hr');
        return;
      }
      if (activeRole === 'college_admin' && collegeOnboardingComplete && pathname === '/college/onboarding') {
        router.replace('/college');
        return;
      }

      // Force onboarding if not complete (only if not already on onboarding page)
      if (activeRole === 'hr' && !hrOnboardingComplete && pathname !== '/hr/onboarding') {
        router.replace('/hr/onboarding');
        return;
      }
      if (activeRole === 'college_admin' && !collegeOnboardingComplete && pathname !== '/college/onboarding') {
        router.replace('/college/onboarding');
        return;
      }

      // 4. Student Specific Status Redirection
      if (activeRole === 'student' && studentDetails) {
        const status = studentDetails.status;
        const isWaitlistPage = pathname === '/student/waitlist';
        const isVerifyPage = pathname === '/student/verify';
        const isSetupPage = pathname === '/student/setup';
        
        // 4. Student Specific Status Redirection
        if (status === 'ACTIVE') {
          if (isWaitlistPage || isVerifyPage || isSetupPage) {
            router.replace('/student');
          }
          return;
        }

        // Handle Pending Verification
        if (status === 'PENDING_VERIFICATION') {
          // If they have no proof URL, they MUST be at verify page
          if (!studentDetails.proofUrl && !isVerifyPage && !isSetupPage) {
            router.replace('/student/verify');
            return;
          }
          // If they HAVE proof URL, they MUST be at waitlist page
          if (studentDetails.proofUrl && !isWaitlistPage) {
            router.replace('/student/waitlist');
            return;
          }
          return;
        }

        // Handle Rejected
        if (status === 'REJECTED' && !isVerifyPage) {
          router.replace('/student/verify');
          return;
        }
      }

      const isAccessingOtherRolePath = Object.entries(rolePrefixes).some(([role, prefix]) => {
        const isSetupFlow = pathname === '/interviewer/setup' || pathname === '/student/setup' || pathname === '/student/verify' || pathname === '/student/waitlist';
        return role !== activeRole && pathname.startsWith(prefix) && !isSetupFlow;
      });

      if (isAccessingOtherRolePath) {
        router.replace(getDashboardPath(activeRole));
        return;
      }
    }
  }, [isAuthenticated, activeRole, pathname, router, hrDetails, collegeAdminDetails, studentDetails]);

  return <>{children}</>;
}
