import { RegisterCompanyUseCase } from "@application/usecases/auth/hr/implementations/RegisterCompany.usecase";
import { UpdateCompanyOnboardingUseCase } from "@application/usecases/auth/hr/implementations/UpdateCompanyOnboarding.usecase";
import { AddInterviewerUseCase } from "@application/usecases/hr/interviewer-management/AddInterviewer.usecase";
import { GetInterviewersUseCase } from "@application/usecases/hr/interviewer-management/GetInterviewers.usecase";
import { ToggleInterviewerStatusUseCase } from "@application/usecases/hr/interviewer-management/ToggleInterviewerStatus.usecase";
import { VerifyCompanyOtpUseCase } from "@application/usecases/auth/hr/implementations/VerifyCompanyOtp.usecase";
import { companyRepository, hrUserRepository, interviewerRepository, bcryptService, jwtService, otpRepository, crossRoleAuthService, superAdminRepository, collegeAdminRepository, studentRepository } from "@infrastructure/di/infra.container";
import { HRAuthController } from "@presentation/http/controllers/auth/hr/hr.auth.controller";
import { InterviewerManagementController } from "@presentation/http/controllers/hr/interviewer.management.controller";
import { MockEmailService } from "@infrastructure/services/email/MockEmailService";

import { EmailService } from "@infrastructure/services/email/email.service";
import { LoginHRUseCase } from "@application/usecases/auth/hr/implementations/LoginHR.usecase";
import { UpdateInterviewerUseCase } from "@application/usecases/hr/interviewer-management/UpdateInterviewer.usecase";
import { DeleteInterviewerUseCase } from "@application/usecases/hr/interviewer-management/DeleteInterviewer.usecase";
import { RestoreInterviewerUseCase } from "@application/usecases/hr/interviewer-management/RestoreInterviewer.usecase";
import { ResendInterviewerInviteUseCase } from "@application/usecases/hr/interviewer-management/ResendInterviewerInvite.usecase";
import { GetHRDashboardStatsUseCase } from "@application/usecases/hr/dashboard/GetHRDashboardStats.usecase";
import { HRDashboardController } from "@presentation/http/controllers/hr/hr.dashboard.controller";


const emailService = new EmailService();

export const makeLoginHRUseCase = () => {
  return new LoginHRUseCase(hrUserRepository, companyRepository, jwtService, bcryptService);
};

export const makeRegisterCompanyUseCase = () => {
  return new RegisterCompanyUseCase(companyRepository, hrUserRepository, bcryptService, jwtService, otpRepository, emailService, crossRoleAuthService);
};

export const makeVerifyCompanyOtpUseCase = () => {
  return new VerifyCompanyOtpUseCase(otpRepository, hrUserRepository, companyRepository, jwtService);
};

export const makeUpdateCompanyOnboardingUseCase = () => {
  return new UpdateCompanyOnboardingUseCase(companyRepository);
};

export const makeHRAuthController = () => {
  return new HRAuthController(
    makeRegisterCompanyUseCase(),
    makeUpdateCompanyOnboardingUseCase(),
    makeVerifyCompanyOtpUseCase(),
    makeLoginHRUseCase()
  );
};

export const makeAddInterviewerUseCase = () => {
  return new AddInterviewerUseCase(interviewerRepository, emailService, jwtService, crossRoleAuthService);
};

export const makeGetInterviewersUseCase = () => {
  return new GetInterviewersUseCase(interviewerRepository);
};

export const makeToggleInterviewerStatusUseCase = () => {
  return new ToggleInterviewerStatusUseCase(interviewerRepository);
};

export const makeResendInterviewerInviteUseCase = () => {
  return new ResendInterviewerInviteUseCase(interviewerRepository, emailService, jwtService);
};

export const makeUpdateInterviewerUseCase = () => {
  return new UpdateInterviewerUseCase(interviewerRepository);
};

export const makeDeleteInterviewerUseCase = () => {
  return new DeleteInterviewerUseCase(interviewerRepository);
};

export const makeRestoreInterviewerUseCase = () => {
  return new RestoreInterviewerUseCase(interviewerRepository);
};

export const makeInterviewerManagementController = () => {
  return new InterviewerManagementController(
    makeAddInterviewerUseCase(),
    makeGetInterviewersUseCase(),
    makeToggleInterviewerStatusUseCase(),
    makeResendInterviewerInviteUseCase(),
    makeUpdateInterviewerUseCase(),
    makeDeleteInterviewerUseCase(),
    makeRestoreInterviewerUseCase()
  );
};

export const makeGetHRDashboardStatsUseCase = () => {
  return new GetHRDashboardStatsUseCase(interviewerRepository);
};

export const makeHRDashboardController = () => {
  return new HRDashboardController(makeGetHRDashboardStatsUseCase());
};
