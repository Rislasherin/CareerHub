import { apiClient } from '@/services/api/api.client';

// ─── Types ────────────────────────────────────────────────────────────────────
export type UserRole = 'student' | 'hr' | 'interviewer' | 'college_admin' | 'super_admin';

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
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
 * Login any role by hitting the correct endpoint.
 * The backend sets httpOnly cookies (accessToken + refreshToken) in the response.
 */
export const loginUser = async (
  role: UserRole,
  payload: LoginPayload
): Promise<{ user: AuthUser; isFirstLogin?: boolean }> => {
  const path = `${roleToPath[role]}/login`;
  const response = await apiClient.post(path, payload) as any;

  // Normalize the returned user shape across all roles
  const rawUser = response.data?.student || response.data?.hrUser || response.data?.user || response.data;

  return {
    user: {
      id: rawUser?.id || rawUser?._id,
      firstName: rawUser?.firstName,
      lastName: rawUser?.lastName,
      email: rawUser?.email,
      role,
    },
    isFirstLogin: response.data?.isFirstLogin ?? false,
  };
};

/**
 * Register a company (HR) — also logs the user in and sets cookies.
 */
export const registerHR = async (payload: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  companyName: string;
}): Promise<{ user: AuthUser }> => {
  const response = await apiClient.post('/auth/hr/register', payload) as any;
  const rawUser = response.data?.hrUser;
  return {
    user: {
      id: rawUser?.id,
      firstName: rawUser?.firstName,
      lastName: rawUser?.lastName,
      email: rawUser?.email,
      role: 'hr',
    },
  };
};

/**
 * Register an institution (College Admin).
 */
export const registerCollege = async (payload: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  organizationName: string;
  city: string;
  state: string;
}): Promise<void> => {
  await apiClient.post('/auth/college-admin/register', payload);
};

/**
 * Logout — clears httpOnly cookies on the server.
 */
export const logoutUser = async (): Promise<void> => {
  await apiClient.post('/auth/logout', {});
};
