import { IEmailService } from "@application/services/IEmailService";
import { IStudentRepository } from "@domain/repositories/IStudentRepository";
import { IOrganizationRepository } from "@domain/repositories/IOrganizationRepository";
import { ICompanyRepository } from "@domain/repositories/ICompanyRepository";

import { IHRUserRepository } from "@domain/repositories/IHRUserRepository";
import { ICollegeAdminRepository } from "@domain/repositories/ICollegeAdminRepository";
import { Role } from "@domain/enums/Roles.enum";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { UserStatus } from "@domain/enums/user.status.enum";

import { IUpdateUserStatusUseCase } from "../interfaces/IUpdateUserStatus.usecase";

export class UpdateUserStatusUseCase implements IUpdateUserStatusUseCase {
  constructor(
    private readonly studentRepo: IStudentRepository,
    private readonly orgRepo: IOrganizationRepository,
    private readonly companyRepo: ICompanyRepository,
    
    private readonly hrRepo: IHRUserRepository,
    private readonly collegeAdminRepo: ICollegeAdminRepository,
    private readonly emailService: IEmailService
  ) { }

  async execute(role: string, id: string, status: string, adminRole?: string, reason?: string, adminId?: string): Promise<void> {
    switch (role) {
      case Role.STUDENT:
        await this.studentRepo.updateStatus(id, status, adminRole);
        break;
      case Role.COLLEGE_ADMIN: {
        if (adminRole !== Role.SUPER_ADMIN) {
          throw new AppError("Forbidden: Only Super Admin can review college status", HttpStatus.FORBIDDEN, ErrorCode.FORBIDDEN);
        }

        const org = await this.orgRepo.findById(id);
        if (!org) {
          throw new AppError("Organization not found", HttpStatus.NOT_FOUND, ErrorCode.USER_NOT_FOUND);
        }

        const normalizedStatus = status.toUpperCase() === 'APPROVED' 
          ? UserStatus.ACTIVE 
          : (status.toUpperCase() === 'PENDING_REVIEW' ? UserStatus.PENDING : status.toUpperCase() as UserStatus);

        // State transition and validation rules
        if (normalizedStatus === UserStatus.ACTIVE) {
          if (org.status === UserStatus.REJECTED) {
            throw new AppError("Cannot approve a rejected organization. The college must edit and resubmit first.", HttpStatus.BAD_REQUEST, ErrorCode.INVALID_STATUS);
          }
          if (org.status === UserStatus.ACTIVE) {
            throw new AppError("Organization is already approved", HttpStatus.BAD_REQUEST, ErrorCode.INVALID_STATUS);
          }
        } else if (normalizedStatus === UserStatus.REJECTED) {
          if (org.status === UserStatus.ACTIVE) {
            throw new AppError("Cannot reject an already approved organization", HttpStatus.BAD_REQUEST, ErrorCode.INVALID_STATUS);
          }
          if (org.status === UserStatus.REJECTED) {
            throw new AppError("Organization is already rejected", HttpStatus.BAD_REQUEST, ErrorCode.INVALID_STATUS);
          }
          if (!reason || !reason.trim()) {
            throw new AppError("Rejection reason is required", HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
          }
        }

        const trimmedReason = reason?.trim();
        await this.orgRepo.updateStatus(id, normalizedStatus, adminRole, trimmedReason, adminId);
        
        const collegeAdmin = await this.collegeAdminRepo.findByOrgId(id);
        if (collegeAdmin) {
          await this.collegeAdminRepo.updateStatus(collegeAdmin.id as string, normalizedStatus, adminRole);
        }

        if (normalizedStatus === UserStatus.ACTIVE && collegeAdmin) {
          await this.emailService.sendAccountApprovalEmail(collegeAdmin.email, collegeAdmin.firstName || "College Admin");
        } else if (normalizedStatus === UserStatus.REJECTED && collegeAdmin && trimmedReason) {
          await this.emailService.sendAccountRejectionEmail(collegeAdmin.email, collegeAdmin.firstName || "College Admin", trimmedReason);
        }
        break;
      }
      case 'company':
      case Role.HR: {
        if (adminRole !== Role.SUPER_ADMIN) {
          throw new AppError("Forbidden: Only Super Admin can review company status", HttpStatus.FORBIDDEN, ErrorCode.FORBIDDEN);
        }

        let hrUser = await this.hrRepo.findById(id);
        let company = hrUser?.companyId ? await this.companyRepo.findById(hrUser.companyId) : null;
        if (!hrUser) {
          company = await this.companyRepo.findById(id);
          if (company?.id) {
            const hrUsers = await this.hrRepo.findByCompanyId(company.id);
            hrUser = hrUsers[0] || null;
          }
        }

        if (!company && !hrUser) {
          throw new AppError("Company or HR user not found", HttpStatus.NOT_FOUND, ErrorCode.USER_NOT_FOUND);
        }

        const normalizedStatus = status.toUpperCase() === 'APPROVED'
          ? UserStatus.ACTIVE
          : (status.toUpperCase() === 'PENDING_REVIEW' ? UserStatus.PENDING : status.toUpperCase() as UserStatus);

        const currentStatus = company?.status || hrUser?.status;

        // State transition and validation rules
        if (normalizedStatus === UserStatus.ACTIVE) {
          if (currentStatus === UserStatus.REJECTED) {
            throw new AppError("Cannot approve a rejected company. The company must edit and resubmit first.", HttpStatus.BAD_REQUEST, ErrorCode.INVALID_STATUS);
          }
          if (currentStatus === UserStatus.ACTIVE) {
            throw new AppError("Company is already approved", HttpStatus.BAD_REQUEST, ErrorCode.INVALID_STATUS);
          }
        } else if (normalizedStatus === UserStatus.REJECTED) {
          if (currentStatus === UserStatus.ACTIVE) {
            throw new AppError("Cannot reject an already approved company", HttpStatus.BAD_REQUEST, ErrorCode.INVALID_STATUS);
          }
          if (currentStatus === UserStatus.REJECTED) {
            throw new AppError("Company is already rejected", HttpStatus.BAD_REQUEST, ErrorCode.INVALID_STATUS);
          }
          if (!reason || !reason.trim()) {
            throw new AppError("Rejection reason is required", HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
          }
        }

        const trimmedReason = reason?.trim();

        if (company?.id) {
          await this.companyRepo.updateStatus(company.id, normalizedStatus, adminRole, trimmedReason, adminId);
        }

        if (hrUser?.id) {
          await this.hrRepo.updateStatus(hrUser.id, normalizedStatus, adminRole);
        }

        if (normalizedStatus === UserStatus.ACTIVE && hrUser) {
          await this.emailService.sendAccountApprovalEmail(hrUser.email, hrUser.firstName || "Company Admin");
        } else if (normalizedStatus === UserStatus.REJECTED && hrUser && trimmedReason) {
          await this.emailService.sendAccountRejectionEmail(hrUser.email, hrUser.firstName || "Company Admin", trimmedReason);
        }
        break;
      }
      default:
        throw new AppError("Invalid role for status update", HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
    }
  }
}
