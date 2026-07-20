export const API_ROUTES = {
  SUPER_ADMIN: {
    DASHBOARD_STATS: '/super-admin/dashboard/stats',
    ORGANIZATIONS: '/super-admin/organizations',
    STUDENTS: '/super-admin/students',
    COMPANIES: '/super-admin/companies',
    INTERVIEWERS: '/super-admin/interviewers',
    MANAGEMENT: '/super-admin/management',
    BILLING: '/super-admin/billing',
  },
  STUDENT: {
    PROFILE: '/student/profile',
    RESUME: '/student/resume',
    JOBS: '/student/jobs',
    APPLICATIONS: '/student/applications',
    VERIFY: '/student/verify',
    INTERVIEWS:  '/student/interviews',
  },
  HR: {
    JOBS: '/hr/jobs',
    INTERVIEWERS: '/hr/interviewers',
    DASHBOARD_STATS: '/hr/dashboard/stats',
    CANDIDATES: '/hr/candidates',
    APPLICATIONS: '/hr/applications',
    INTERVIEWS: '/hr/interviews',
    RESCHEDULE_REQUESTS: '/hr/interviews/reschedule-requests'
  },
  COLLEGE: {
    JOBS: '/college/jobs',
    DASHBOARD_STATS: '/college/dashboard/stats',
    STUDENTS: '/college/students',
    STUDENTS_PENDING: '/college/students/pending',
    STUDENTS_BULK_INVITE: '/college/students/bulk-invite',
    STATUS_TOGGLE: '/college/status-toggle',
  },
  INTERVIEWER: {
    ACTIVATE: '/auth/interviewer/activate',
    DASHBOARD: '/interviewer/dashboard',
    INTERVIEWS: '/interviewer/interviews',
    RESCHEDULE: '/interviewer/interviews', // usage: /interviewer/interviews/:id/reschedule
    SUBMIT_FEEDBACK: '/interviewer/interviews/:id/feedback'
  },
  AUTH: {
    ORGANIZATIONS_APPROVED: '/auth/organizations/approved',
    HR_REGISTER: '/auth/hr/register',
    HR_VERIFY_OTP: '/auth/hr/verify-otp',
    HR_ONBOARDING: '/auth/hr/onboarding',
    COLLEGE_ADMIN_REGISTER: '/auth/college-admin/register',
    COLLEGE_ADMIN_VERIFY_OTP: '/auth/college-admin/verify-otp',
    COLLEGE_ADMIN_ONBOARDING: '/auth/college-admin/onboarding',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    LOGOUT: '/auth/logout',
    STATUS: '/auth/status',
    STUDENT_ME: '/auth/student/me',
    STUDENT_VERIFY_TOKEN: '/auth/student/verify-token',
    STUDENT_SETUP_PASSWORD: '/auth/student/setup-password',
    STUDENT_REQUEST_ACCESS: '/auth/student/request-access',
    INTERVIEWER_VERIFY_TOKEN: '/auth/interviewer/verify-token',
    INTERVIEWER_ACTIVATE: '/auth/interviewer/activate',
  },
  NOTIFICATIONS: {
    STUDENT:    '/student/notifications',
    HR:         '/hr/notifications',
    INTERVIEWER: '/interviewer/notifications',
    COLLEGE:    '/college/notifications',
    SUPER_ADMIN: '/super-admin/notifications',
  },
  SUBSCRIPTION: {
    CREATE: '/subscription/create',
    GET_MY_PLAN: '/subscription/my-plan'
  }
};

