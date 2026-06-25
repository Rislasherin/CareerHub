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
