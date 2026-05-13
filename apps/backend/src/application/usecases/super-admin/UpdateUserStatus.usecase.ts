import { IStudentRepository } from "@domain/repositories/IStudentRepository";
import { IOrganizationRepository } from "@domain/repositories/IOrganizationRepository";
import { ICompanyRepository } from "@domain/repositories/ICompanyRepository";
import { IInterviewerRepository } from "@domain/repositories/IInterviewerRepository";
import { IHRUserRepository } from "@domain/repositories/IHRUserRepository";
import { Role } from "@domain/enums/Roles.enum";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";

export class UpdateUserStatusUseCase {
  constructor(
    private readonly studentRepo: IStudentRepository,
    private readonly orgRepo: IOrganizationRepository,
    private readonly companyRepo: ICompanyRepository,
    private readonly interviewerRepo: IInterviewerRepository,
    private readonly hrRepo: IHRUserRepository
  ) {}

  async execute(role: string, id: string, status: string, adminRole?: string): Promise<void> {
    switch (role) {
      case Role.STUDENT:
        await this.studentRepo.updateStatus(id, status, adminRole);
        break;
      case Role.COLLEGE_ADMIN:
        await this.orgRepo.updateStatus(id, status, adminRole);
        break;
      case Role.HR:
        await this.hrRepo.updateStatus(id, status, adminRole);
        break;
      case Role.INTERVIEWER:
        await this.interviewerRepo.updateStatus(id, status, adminRole);
        break;
      default:
        throw new AppError("Invalid role for status update", HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
    }
  }
}
