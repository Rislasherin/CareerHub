import { RegisterCompanyUseCase } from "@application/usecases/auth/hr/implementations/RegisterCompany.usecase";
import { UpdateCompanyOnboardingUseCase } from "@application/usecases/auth/hr/implementations/UpdateCompanyOnboarding.usecase";
import { AddInterviewerUseCase } from "@application/usecases/hr/interviewer-management/AddInterviewer.usecase";
import { GetInterviewersUseCase } from "@application/usecases/hr/interviewer-management/GetInterviewers.usecase";
import { companyRepository, hrUserRepository, interviewerRepository, bcryptService, jwtService } from "@infrastructure/di/infra.container";
import { HRAuthController } from "@presentation/http/controllers/auth/hr/hr.auth.controller";
import { InterviewerManagementController } from "@presentation/http/controllers/hr/interviewer.management.controller";
import { MockEmailService } from "@infrastructure/services/email/MockEmailService";

const emailService = new MockEmailService();

export const makeRegisterCompanyUseCase = () => {
  return new RegisterCompanyUseCase(companyRepository, hrUserRepository, bcryptService, jwtService);
};

export const makeUpdateCompanyOnboardingUseCase = () => {
  return new UpdateCompanyOnboardingUseCase(companyRepository);
};

export const makeHRAuthController = () => {
  return new HRAuthController(
    makeRegisterCompanyUseCase(),
    makeUpdateCompanyOnboardingUseCase()
  );
};

export const makeAddInterviewerUseCase = () => {
  return new AddInterviewerUseCase(interviewerRepository, emailService, jwtService);
};

export const makeGetInterviewersUseCase = () => {
  return new GetInterviewersUseCase(interviewerRepository);
};

export const makeInterviewerManagementController = () => {
  return new InterviewerManagementController(
    makeAddInterviewerUseCase(),
    makeGetInterviewersUseCase()
  );
};
