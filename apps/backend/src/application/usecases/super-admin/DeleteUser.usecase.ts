import { IStudentRepository } from "@domain/repositories/IStudentRepository";
import { IOrganizationRepository } from "@domain/repositories/IOrganizationRepository";
import { ICompanyRepository } from "@domain/repositories/ICompanyRepository";
import { IInterviewerRepository } from "@domain/repositories/IInterviewerRepository";
import { IHRUserRepository } from "@domain/repositories/IHRUserRepository";
import { Role } from "@domain/enums/Roles.enum";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";

import { IDeleteUserUseCase } from "./interfaces/IDeleteUser.usecase";

export class DeleteUserUseCase implements IDeleteUserUseCase {
  constructor(
    private readonly studentRepo: IStudentRepository,
    private readonly orgRepo: IOrganizationRepository,
    private readonly companyRepo: ICompanyRepository,
    private readonly interviewerRepo: IInterviewerRepository,
    private readonly hrRepo: IHRUserRepository
  ) { }

  async execute(role: string, id: string): Promise<void> {
    switch (role) {
      case Role.STUDENT:
        await this.studentRepo.delete(id);
        break;
      case Role.COLLEGE_ADMIN:
        await this.orgRepo.delete(id);
        break;
      case Role.HR:
        await this.hrRepo.delete(id);
        break;
      case Role.INTERVIEWER:
        await this.interviewerRepo.delete(id);
        break;
      default:
        throw new AppError("Invalid role for deletion", HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
    }
  }
}
