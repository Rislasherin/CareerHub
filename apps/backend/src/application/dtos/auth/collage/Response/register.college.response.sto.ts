import { Role } from "@domain/enums/Roles.enum";
import { UserStatus } from "@domain/enums/user.status.enum";

export interface RegisterCollegeResponseDto {
  requiresOtp: boolean;
  email: string;
  message: string;
  accessToken?: string;
  refreshToken?: string;
  collegeAdmin?: {
    id?: string;
    firstName: string;
    lastName: string;
    email: string;
    role: Role;
    status: UserStatus;
    orgId: string;
  };
}