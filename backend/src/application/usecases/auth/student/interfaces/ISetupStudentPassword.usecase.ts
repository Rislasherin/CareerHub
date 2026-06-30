import { Role } from "@domain/enums/Roles.enum";
import { UserStatus } from "@domain/enums/user.status.enum";

export interface SetupPasswordResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id?: string;
    firstName: string;
    lastName: string;
    email: string;
    role: Role;
    status: UserStatus;
  }
}

export interface ISetupStudentPasswordUseCase {
  execute(token: string, password: string): Promise<SetupPasswordResponse>;
}
