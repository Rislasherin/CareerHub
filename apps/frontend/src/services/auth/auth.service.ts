import { apiClient } from '@/services/api/api.client';

// ─── Types ────────────────────────────────────────────────────────────────────
export type UserRole = 'student' | 'hr' | 'interviewer' | 'college_admin' | 'super_admin';

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  status: string;
  companyId?: string;
  companyName?: string;
  orgId?: string;
  collegeName?: string;
  onboardingStep?: number;
}

export interface LoginPayload {
  email: string;
  password: string;
}

// ─── Role → API path mapping ──────────────────────────────────────────────────
const roleToPath: Record<UserRole, string> = {
  student: '/auth/student',
  hr: '/auth/hr',
  interviewer: '/auth/interviewer',
  college_admin: '/auth/college-admin',
  super_admin: '/auth/super-admin',
};

// ─── Auth Service ─────────────────────────────────────────────────────────────

/**
 * Login type role by hitting the correct endpoint.
 */
export const loginUser = async (
  role: UserRole,
  payload: LoginPayload
): Promise<{ user: AuthUser; isFirstLogin?: boolean }> => {
  const path = `${roleToPath[role]}/login`;
  const response = await apiClient.post(path, payload) as type;
  const data = response.data;

  // Normalize the returned user shape across all roles
  const rawUser = data?.student || data?.hrUser || data?.interviewer || data?.admin || data?.user || data?.collegeAdmin || data;
  const company = data?.company;
  const organization = data?.organization;

  return {
    user: {
      id: rawUser?.id || rawUser?._id,
      firstName: rawUser?.firstName,
      lastName: rawUser?.lastName,
      email: rawUser?.email,
      role,
      status: rawUser?.status || 'ACTIVE',
      // For HR
      companyId: company?.id || rawUser?.companyId,
      companyName: company?.name,
      // For College Admin
      orgId: organization?.id || rawUser?.organizationId || rawUser?.orgId,
      collegeName: organization?.name,
      // Onboarding Step
      onboardingStep: company?.onboardingStep || organization?.onboardingStep,
    },
    isFirstLogin: rawUser?.isFirstLogin ?? false,
  };
};

/**
 * Register a company (HR)
 */
export const registerHR = async (payload: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  jobTitle: string;
}): Promise<{ requiresOtp?: boolean; email?: string; message?: string; user?: AuthUser }> => {
  const response = await apiClient.post('/auth/hr/register', payload) as type;
  const data = response.data;

  if (data?.requiresOtp) {
    return {
      requiresOtp: true,
      email: data.email,
      message: data.message
    };
  }

  const rawUser = data?.hrUser;
  return {
    user: {
      id: rawUser?.id,
      firstName: rawUser?.firstName,
      lastName: rawUser?.lastName,
      email: rawUser?.email,
      role: 'hr',
      status: rawUser?.status || 'ACTIVE',
    },
  };
};

export const verifyHROtp = async (payload: { email: string; otp: string }): Promise<{ user: type }> => {
  const response = await apiClient.post('/auth/hr/verify-otp', payload) as type;
  const data = response.data;
  const rawUser = data?.hrUser;
  const company = data?.company;

  return {
    user: {
      id: rawUser?.id,
      firstName: rawUser?.firstName,
      lastName: rawUser?.lastName,
      email: rawUser?.email,
      role: 'hr',
      status: rawUser?.status || 'ACTIVE',
      companyId: company?.id,
      companyName: company?.name,
      onboardingStep: company?.onboardingStep,
    },
  };
};

export const updateHROnboarding = async (payload: type): Promise<type> => {
  const response = await apiClient.patch('/auth/hr/onboarding', payload) as type;
  return response.data;
};

export const updateCollegeOnboarding = async (payload: type): Promise<type> => {
  const response = await apiClient.patch('/auth/college-admin/onboarding', payload) as type;
  return response.data;
};



export const registerCollege = async (payload: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}): Promise<{ requiresOtp?: boolean; email?: string; message?: string }> => {
  const response = await apiClient.post('/auth/college-admin/register', payload) as type;
  return response.data;
};

export const verifyCollegeOtp = async (payload: { email: string; otp: string }): Promise<{ user: type }> => {
  const response = await apiClient.post('/auth/college-admin/verify-otp', payload) as type;
  const data = response.data;
  const rawUser = data?.collegeAdmin;
  const organization = data?.organization || data?.collegeAdmin?.organization;

  return {
    user: {
      id: rawUser?.id,
      firstName: rawUser?.firstName,
      lastName: rawUser?.lastName,
      email: rawUser?.email,
      role: 'college_admin',
      status: rawUser?.status || 'ACTIVE',
      orgId: rawUser?.orgId,
      collegeName: organization?.name,
      onboardingStep: organization?.onboardingStep,
    },
  };
};

/**
 * Activate an Interviewer account.
 */
export const activateInterviewer = async (password: string, token: string, email?: string): Promise<{ user: AuthUser }> => {
  const response = await apiClient.post(
    '/auth/interviewer/activate',
    { password },
    {
      params: { email },
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  ) as type;
  const data = response.data;
  const rawUser = data?.user;

  return {
    user: {
      id: rawUser?.id,
      firstName: rawUser?.firstName,
      lastName: rawUser?.lastName,
      email: rawUser?.email,
      role: 'interviewer',
      status: rawUser?.status || 'ACTIVE',
    },
  };
};

/**
 * Forgot Password
 */
export const forgotPassword = async (email: string): Promise<void> => {
  await apiClient.post('/auth/forgot-password', { email });
};

export const resetPassword = async (payload: { token: string; password: string }): Promise<void> => {
  await apiClient.post('/auth/reset-password', payload);
};

/**
 * Logout
 */
export const logoutUser = async (): Promise<void> => {
  await apiClient.post('/auth/logout', {});
};
