import { IStudentRepository } from "@domain/repositories/IStudentRepository";
import { UserStatus } from "@domain/enums/user.status.enum";
import { InviteStudentsDto } from "@application/dtos/auth/student/Request/InviteStudents.dto";
import { IEmailService } from "@application/services/IEmailService";
import { v4 as uuidv4 } from "uuid";
import { Student } from "@domain/entities/student";
import { CrossRoleAuthService } from "@application/services/CrossRoleAuthService";

export interface IBulkInviteStudentsUseCase {
  execute(collegeId: string, dto: InviteStudentsDto): Promise<any>;
}
