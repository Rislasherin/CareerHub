import { IStudentRepository } from "@domain/repositories/IStudentRepository";
import { UserStatus } from "@domain/enums/user.status.enum";

export interface IGetPendingStudentsUseCase {
  execute(orgId: string, status?: UserStatus): Promise<any[]>;
}
