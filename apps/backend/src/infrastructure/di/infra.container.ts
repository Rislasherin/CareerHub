import { StudentRepository } from "@infrastructure/repositories/student.repository";
import { SuperAdminRepository } from "@infrastructure/repositories/SuperAdminRepository";
import { CompanyRepository } from "@infrastructure/repositories/CompanyRepository";
import { HRUserRepository } from "@infrastructure/repositories/HRUserRepository";
import { InterviewerRepository } from "@infrastructure/repositories/InterviewerRepository";
import { OtpRepository } from "@infrastructure/repositories/OtpRepository";
import { CollegeAdminRepository } from "@infrastructure/repositories/college-admin.repository";
import { OrganizationRepository } from "@infrastructure/repositories/organization.repository";
import { BcryptService } from "@infrastructure/services/hash/bcrypt.service";
import { JwtService } from "@infrastructure/services/token/jwt.service";
import { AuthMiddleware } from "@presentation/express/middlewares/auth.middleware";
import { CrossRoleAuthService } from "@application/services/CrossRoleAuthService";

export const studentRepository = new StudentRepository();
export const superAdminRepository = new SuperAdminRepository();
export const companyRepository = new CompanyRepository();
export const hrUserRepository = new HRUserRepository();
export const interviewerRepository = new InterviewerRepository();
export const otpRepository = new OtpRepository();
export const collegeAdminRepository = new CollegeAdminRepository();
export const organizationRepository = new OrganizationRepository();
export const jwtService = new JwtService();
export const bcryptService = new BcryptService();
export const authMiddleware = new AuthMiddleware(
    jwtService,
    studentRepository,
    hrUserRepository,
    interviewerRepository,
    collegeAdminRepository,
    superAdminRepository,
    organizationRepository,
    companyRepository
);
export const crossRoleAuthService = new CrossRoleAuthService(
    studentRepository,
    hrUserRepository,
    interviewerRepository,
    collegeAdminRepository,
    superAdminRepository
);
