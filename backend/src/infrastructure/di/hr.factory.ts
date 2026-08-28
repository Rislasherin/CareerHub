import { RegisterCompanyUseCase } from "@application/usecases/auth/hr/implementations/RegisterCompany.usecase";
import { UpdateCompanyOnboardingUseCase } from "@application/usecases/auth/hr/implementations/UpdateCompanyOnboarding.usecase";

import { VerifyCompanyOtpUseCase } from "@application/usecases/auth/hr/implementations/VerifyCompanyOtp.usecase";
import { GetHRDashboardStatsUseCase } from "@application/usecases/hr/dashboard/implementations/GetHRDashboardStats.usecase";;
import { HRDashboardController } from "@presentation/http/controllers/hr/hr.dashboard.controller";
import { PostJobUseCase } from "@application/usecases/hr/job-engine/implementations/PostJob.usecase";;
import { UpdateJobUseCase } from "@application/usecases/hr/job-engine/implementations/UpdateJob.usecase";;
import { GetHRJobsUseCase } from "@application/usecases/hr/job-engine/implementations/GetHRJobs.usecase";;
import { CloseJobUseCase } from "@application/usecases/hr/job-engine/implementations/CloseJob.usecase";;
import { DeleteJobUseCase } from "@application/usecases/hr/job-engine/implementations/DeleteJob.usecase";;
import { HRJobController } from "@presentation/http/controllers/hr/job.controller";
import { GetHRCandidatesUseCase } from "@application/usecases/hr/job-engine/implementations/GetHRCandidates.usecase";
import { GetHRJobApplicationsUseCase } from "@application/usecases/hr/job-engine/implementations/GetHRJobApplications.usecase";
import { GetHRHireRequestsUseCase } from "@application/usecases/hr/job-engine/implementations/GetHRHireRequests.usecase";
import { UpdateApplicationStatusUseCase } from "@application/usecases/hr/job-engine/implementations/UpdateApplicationStatus.usecase";
import { companyRepository, hrUserRepository, bcryptService, jwtService, otpRepository, crossRoleAuthService, superAdminRepository, collegeAdminRepository, studentRepository, jobRepository, jobApplicationRepository, interviewRepository, organizationRepository, createSystemNotificationUseCase } from "@infrastructure/di/infra.container";
import { HRAuthController } from "@presentation/http/controllers/auth/hr/hr.auth.controller";

import { EmailService } from "@infrastructure/services/email/email.service";
import { LoginHRUseCase } from "@application/usecases/auth/hr/implementations/LoginHR.usecase";

import { GetCandidateProfileUseCase } from "@application/usecases/hr/job-engine/implementations/GetCandidateProfile.usecase";
import { JobApplicationRepository } from "@infrastructure/repositories/jobApplication.repository";

import { offerRepository } from "@infrastructure/di/infra.container";
import { HROfferController } from "@presentation/http/controllers/hr/hr.offer.controller";
import { GenerateOfferUseCase } from "@application/usecases/hr/offer-engine/implementations/GenerateOffer.usecase";
import { GetHROffersUseCase } from "@application/usecases/hr/offer-engine/implementations/GetHROffers.usecase";
import { ResendOfferEmailUseCase } from "@application/usecases/hr/offer-engine/implementations/ResendOfferEmail.usecase";
import { GenerateOfferPdfUseCase } from "@application/usecases/hr/offer-engine/implementations/GenerateOfferPdf.usecase";

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



export const makeGetHRDashboardStatsUseCase = () => {
  return new GetHRDashboardStatsUseCase(
    jobApplicationRepository,
    jobRepository,
    interviewRepository,
    offerRepository
  );
};

export const makeHRDashboardController = () => {
  return new HRDashboardController(makeGetHRDashboardStatsUseCase());
};

import { GetHRAnalyticsUseCase } from "@application/usecases/hr/analytics/implementations/GetHRAnalytics.usecase";
import { HRAnalyticsController } from "@presentation/http/controllers/hr/hr.analytics.controller";

export const makeGetHRAnalyticsUseCase = () => {
  return new GetHRAnalyticsUseCase(
    jobApplicationRepository,
    jobRepository,
    offerRepository
  );
};

export const makeHRAnalyticsController = () => {
  return new HRAnalyticsController(makeGetHRAnalyticsUseCase());
};

export const makePostJobUseCase = () => {
  return new PostJobUseCase(jobRepository);
};

export const makeGetHRJobsUseCase = () => {
  return new GetHRJobsUseCase(jobRepository);
};

export const makeCloseJobUseCase = () => {
  return new CloseJobUseCase(jobRepository);
};

export const makeDeleteJobUseCase = () => {
  return new DeleteJobUseCase(jobRepository);
};

export const makeGetHRCandidatesUseCase = () => {
  return new GetHRCandidatesUseCase(jobRepository, studentRepository);
};

export const makeUpdateJobUseCase = () => {
  return new UpdateJobUseCase(jobRepository);
};

export const makeGetCandidateProfileUseCase = () => {
  return new GetCandidateProfileUseCase(studentRepository, organizationRepository)
}

export const makeGetHRJobApplicationsUseCase = () => {
  return new GetHRJobApplicationsUseCase(jobRepository, jobApplicationRepository, studentRepository, interviewRepository);
};

export const makeGetHRHireRequestsUseCase = () => {
  return new GetHRHireRequestsUseCase(jobRepository, jobApplicationRepository, studentRepository);
};

export const makeUpdateApplicationStatusUseCase = () => {
  return new UpdateApplicationStatusUseCase(jobApplicationRepository, createSystemNotificationUseCase);
};



export const makeHRJobController = () => {
  return new HRJobController(
    makePostJobUseCase(),
    makeGetHRJobsUseCase(),
    makeCloseJobUseCase(),
    makeDeleteJobUseCase(),
    makeGetHRCandidatesUseCase(),
    makeUpdateJobUseCase(),
    makeGetCandidateProfileUseCase(),
    makeGetHRJobApplicationsUseCase(),
    makeGetHRHireRequestsUseCase(),
    makeUpdateApplicationStatusUseCase()
  );
};



export const makeHROfferController = () => {
  return new HROfferController(
    new GenerateOfferUseCase(offerRepository, jobApplicationRepository, createSystemNotificationUseCase, interviewRepository),
    new GetHROffersUseCase(offerRepository),
    new ResendOfferEmailUseCase(offerRepository, studentRepository, companyRepository, emailService),
    new GenerateOfferPdfUseCase(offerRepository, studentRepository, companyRepository)
  );
};

import { HRInterviewController } from "@presentation/http/controllers/hr/hr.interview.controller";
import { ScheduleInterviewUseCase } from "@application/usecases/hr/interview/ScheduleInterview.usecase";
import { GetHRInterviewsUseCase } from "@application/usecases/hr/interview/GetHRInterviews.usecase";
import { 
  makeGetInterviewEvaluationUseCase, 
  makeRecordHRDecisionUseCase,
  rabbitMQBroker,
  aiInterviewEvaluationRepository
} from "./ai-interview.factory";

export const makeHRInterviewController = () => {
  return new HRInterviewController(
    new ScheduleInterviewUseCase(interviewRepository, jobApplicationRepository),
    new GetHRInterviewsUseCase(interviewRepository, studentRepository, jobRepository),
    makeGetInterviewEvaluationUseCase(),
    makeRecordHRDecisionUseCase(),
    rabbitMQBroker,
    aiInterviewEvaluationRepository
  );
};

import { GetHRProfileUseCase } from "@application/usecases/hr/settings/implementations/GetHRProfile.usecase";
import { UpdateHRProfileUseCase } from "@application/usecases/hr/settings/implementations/UpdateHRProfile.usecase";
import { ChangeHRPasswordUseCase } from "@application/usecases/hr/settings/implementations/ChangeHRPassword.usecase";
import { RequestHREmailChangeUseCase } from "@application/usecases/hr/settings/implementations/RequestHREmailChange.usecase";
import { VerifyHREmailChangeUseCase } from "@application/usecases/hr/settings/implementations/VerifyHREmailChange.usecase";
import { GetCompanyProfileUseCase } from "@application/usecases/hr/settings/implementations/GetCompanyProfile.usecase";
import { UpdateCompanyProfileUseCase } from "@application/usecases/hr/settings/implementations/UpdateCompanyProfile.usecase";
import { HRSettingsController } from "@presentation/http/controllers/hr/hr-settings.controller";

export const makeHRSettingsController = () => {
  return new HRSettingsController(
    new GetHRProfileUseCase(hrUserRepository),
    new UpdateHRProfileUseCase(hrUserRepository),
    new ChangeHRPasswordUseCase(hrUserRepository, bcryptService),
    new RequestHREmailChangeUseCase(hrUserRepository, otpRepository, emailService),
    new VerifyHREmailChangeUseCase(hrUserRepository, otpRepository),
    new GetCompanyProfileUseCase(companyRepository),
    new UpdateCompanyProfileUseCase(companyRepository)
  );
};
