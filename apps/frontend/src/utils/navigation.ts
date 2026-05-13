import { Role } from "../redux/slices/authSlice";

export const getDashboardPath = (role: Role | null): string => {
  switch (role) {
    case 'super_admin':
      return '/admin';
    case 'college_admin':
      return '/college';
    case 'student':
      return '/student';
    case 'hr':
      return '/hr';
    case 'interviewer':
      return '/interviewer';
    default:
      return '/login';
  }
};
