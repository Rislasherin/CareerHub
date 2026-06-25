import { API_ROUTES } from '@/constants/api.routes';
import { apiClient } from '@/services/api/api.client';

import { UserRole, AuthUser, LoginPayload } from '@/types/auth';
import { ApiResponse } from '@/types/api';

interface AuthResponseData {
  student?: Partial<AuthUser> & { _id?: string };
  hrUser?: Partial<AuthUser>;
  interviewer?: Partial<AuthUser>;
  admin?: Partial<AuthUser>;
  user?: Partial<AuthUser>;
  collegeAdmin?: Partial<AuthUser> & { orgId?: string, organization?: { name?: string, onboardingStep?: number } };
  company?: { id?: string; name?: string; onboardingStep?: number };
  organization?: { id?: string; name?: string; onboardingStep?: number };
  isFirstLogin?: boolean;
  requiresOtp?: boolean;
  email?: string;
  message?: string;
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
  const response = await apiClient.post(path, payload) as ApiResponse<AuthResponseData | Partial<AuthUser>>;
  const data = response.data;

  // Normalize the returned user shape across all roles
  const responseData = data as AuthResponseData;
  const rawUser = responseData?.student || responseData?.hrUser || responseData?.interviewer || responseData?.admin || responseData?.user || responseData?.collegeAdmin || (data as Partial<AuthUser>);
  const company = responseData?.company;
  const organization = responseData?.organization;

  return {
    user: {
      id: rawUser?.id || (rawUser as { _id?: string })?._id || '',
      firstName: rawUser?.firstName || '',
      lastName: rawUser?.lastName || '',
      email: rawUser?.email || '',
      role,
      status: rawUser?.status || 'ACTIVE',
      // For HR
      companyId: company?.id || rawUser?.companyId,
      companyName: company?.name,
      // For College Admin
      orgId: organization?.id || (rawUser as { organizationId?: string })?.organizationId || rawUser?.orgId,
      collegeName: organization?.name,
      // Onboarding Step
      onboardingStep: company?.onboardingStep || organization?.onboardingStep,
    },
    isFirstLogin: (rawUser as { isFirstLogin?: boolean })?.isFirstLogin ?? false,
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
  const response = await apiClient.post(API_ROUTES.AUTH.HR_REGISTER, payload) as ApiResponse<AuthResponseData>;
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
      id: rawUser?.id || '',
      firstName: rawUser?.firstName || '',
      lastName: rawUser?.lastName || '',
      email: rawUser?.email || '',
      role: 'hr',
      status: rawUser?.status || 'ACTIVE',
    },
  };
};

export const verifyHROtp = async (payload: { email: string; otp: string }): Promise<{ user: AuthUser }> => {
  const response = await apiClient.post(API_ROUTES.AUTH.HR_VERIFY_OTP, payload) as ApiResponse<AuthResponseData>;
  const data = response.data;
  const rawUser = data?.hrUser;
  const company = data?.company;

  return {
    user: {
      id: rawUser?.id || '',
      firstName: rawUser?.firstName || '',
      lastName: rawUser?.lastName || '',
      email: rawUser?.email || '',
      role: 'hr',
      status: rawUser?.status || 'ACTIVE',
      companyId: company?.id,
      companyName: company?.name,
      onboardingStep: company?.onboardingStep,
    },
  };
};

export const updateHROnboarding = async (payload: Record<string, unknown>): Promise<unknown> => {
  const response = await apiClient.patch(API_ROUTES.AUTH.HR_ONBOARDING, payload) as ApiResponse<unknown>;
  return response.data;
}

export const updateCollegeOnboarding = async (payload: Record<string, unknown>): Promise<unknown> => {
  const response = await apiClient.patch(API_ROUTES.AUTH.COLLEGE_ADMIN_ONBOARDING, payload) as ApiResponse<unknown>;
  return response.data;
}



export const registerCollege = async (payload: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}): Promise<{ requiresOtp?: boolean; email?: string; message?: string }> => {
  const response = await apiClient.post(API_ROUTES.AUTH.COLLEGE_ADMIN_REGISTER, payload) as ApiResponse<AuthResponseData>;
  return response.data;
};

export const verifyCollegeOtp = async (payload: { email: string; otp: string }): Promise<{ user: AuthUser }> => {
  const response = await apiClient.post(API_ROUTES.AUTH.COLLEGE_ADMIN_VERIFY_OTP, payload) as ApiResponse<AuthResponseData>;
  const data = response.data;
  const rawUser = data?.collegeAdmin;
  const organization = data?.organization || data?.collegeAdmin?.organization;

  return {
    user: {
      id: rawUser?.id || '',
      firstName: rawUser?.firstName || '',
      lastName: rawUser?.lastName || '',
      email: rawUser?.email || '',
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
  ) as ApiResponse<AuthResponseData>;
  const data = response.data;
  const rawUser = data?.user;

  return {
    user: {
      id: rawUser?.id || '',
      firstName: rawUser?.firstName || '',
      lastName: rawUser?.lastName || '',
      email: rawUser?.email || '',
      role: 'interviewer',
      status: rawUser?.status || 'ACTIVE',
    },
  };
};

/**
 * Forgot Password
 */
export const forgotPassword = async (email: string): Promise<void> => {
  await apiClient.post(API_ROUTES.AUTH.FORGOT_PASSWORD, { email });
};

export const resetPassword = async (payload: { token: string; password: string }): Promise<void> => {
  await apiClient.post(API_ROUTES.AUTH.RESET_PASSWORD, payload);
};

/**
 * Logout
 */
export const logoutUser = async (): Promise<void> => {
  await apiClient.post(API_ROUTES.AUTH.LOGOUT, {});
};

