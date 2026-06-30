import { IEmailService } from "@application/services/IEmailService";
import { IStudentRepository } from "@domain/repositories/IStudentRepository";
import { IOrganizationRepository } from "@domain/repositories/IOrganizationRepository";
import { ICompanyRepository } from "@domain/repositories/ICompanyRepository";
import { IInterviewerRepository } from "@domain/repositories/IInterviewerRepository";
import { IHRUserRepository } from "@domain/repositories/IHRUserRepository";
import { ICollegeAdminRepository } from "@domain/repositories/ICollegeAdminRepository";
import { Role } from "@domain/enums/Roles.enum";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";

import { IUpdateUserStatusUseCase } from "../interfaces/IUpdateUserStatus.usecase";

export class UpdateUserStatusUseCase implements IUpdateUserStatusUseCase {
  constructor(
    private readonly studentRepo: IStudentRepository,
    private readonly orgRepo: IOrganizationRepository,
    private readonly companyRepo: ICompanyRepository,
    private readonly interviewerRepo: IInterviewerRepository,
    private readonly hrRepo: IHRUserRepository,
    private readonly collegeAdminRepo: ICollegeAdminRepository,
    private readonly emailService: IEmailService
  ) { }

  async execute(role: string, id: string, status: string, adminRole?: string): Promise<void> {
    switch (role) {
      case Role.STUDENT:
        await this.studentRepo.updateStatus(id, status, adminRole);
        break;
      case Role.COLLEGE_ADMIN: {
        await this.orgRepo.updateStatus(id, status, adminRole);
        
        const collegeAdmin = await this.collegeAdminRepo.findByOrgId(id);
        if (collegeAdmin) {
          await this.collegeAdminRepo.updateStatus(collegeAdmin.id as string, status, adminRole);
        }

        if (status.toUpperCase() === 'ACTIVE' && collegeAdmin) {
          await this.emailService.sendAccountApprovalEmail(collegeAdmin.email, collegeAdmin.firstName || "College Admin");
        }
        break;
      }
      case Role.HR: {
        const hrUser = await this.hrRepo.findById(id);
        if (!hrUser) throw new AppError("HR user not found", HttpStatus.NOT_FOUND, ErrorCode.USER_NOT_FOUND);
        
        await this.hrRepo.updateStatus(id, status, adminRole);
        
        if (hrUser.companyId) {
          await this.companyRepo.updateStatus(hrUser.companyId, status, adminRole);
        }
        
        if (status.toUpperCase() === 'ACTIVE') {
          await this.emailService.sendAccountApprovalEmail(hrUser.email, hrUser.firstName || "HR Manager");
        }
        break;
      }
      case Role.INTERVIEWER:
        await this.interviewerRepo.updateStatus(id, status, adminRole);
        break;
      default:
        throw new AppError("Invalid role for status update", HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
    }
  }
}
