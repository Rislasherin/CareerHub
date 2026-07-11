import { ActivateInterviewerUseCase } from "@application/usecases/auth/interviewer/implementations/ActivateInterviewer.usecase";
import { interviewerRepository, companyRepository, bcryptService, jwtService, crossRoleAuthService, studentRepository, jobRepository, interviewRepository, jobApplicationRepository, createSystemNotificationUseCase } from "@infrastructure/di/infra.container";
import { InterviewerAuthController } from "@presentation/http/controllers/auth/interviewer/interviewer.auth.controller";

import { LoginInterviewerUseCase } from "@application/usecases/auth/interviewer/implementations/LoginInterviewer.usecase";

import { VerifyInterviewerTokenUseCase } from "@application/usecases/auth/interviewer/implementations/VerifyInterviewerToken.usecase";
import { GetInterviewerScheduleUseCase } from "@application/usecases/interviewer/implementations/GetInterviewerSchedule.usecase";
import { RequestInterviewRescheduleUseCase } from "@application/usecases/interviewer/implementations/RequestInterviewReschedule.usecase";
import { InterviewerController } from "@presentation/http/controllers/interviewer/interviewer.controller";
import { SubmitInterviewFeedbackUseCase } from "@application/usecases/interviewer/implementations/SubmitInterviewFeedback.usecase";
import { JobApplicationRepository } from "@infrastructure/repositories/jobApplication.repository";

export const makeActivateInterviewerUseCase = () => {
  return new ActivateInterviewerUseCase(interviewerRepository, bcryptService, jwtService);
};

export const makeLoginInterviewerUseCase = () => {
  return new LoginInterviewerUseCase(interviewerRepository, companyRepository, jwtService, bcryptService, crossRoleAuthService);
};

export const makeVerifyInterviewerTokenUseCase = () => {
  return new VerifyInterviewerTokenUseCase(interviewerRepository, jwtService);
};
export const makeSubmitInterviewFeedbackUseCase = () => {
  return new SubmitInterviewFeedbackUseCase(interviewRepository, jobApplicationRepository, createSystemNotificationUseCase);
}

import { CancelInterviewUseCase } from "@application/usecases/interviewer/implementations/CancelInterview.usecase";

export const makeInterviewerController = () => {
  const getScheduleUseCase = new GetInterviewerScheduleUseCase(
    interviewRepository,
    studentRepository,
    jobRepository
  )
  const requestRescheduleUseCase = new RequestInterviewRescheduleUseCase(
    interviewRepository
  )
  const cancelInterviewUseCase = new CancelInterviewUseCase(
    interviewRepository,
    jobApplicationRepository,
    createSystemNotificationUseCase
  )
  return new InterviewerController(getScheduleUseCase, requestRescheduleUseCase, makeSubmitInterviewFeedbackUseCase(), cancelInterviewUseCase)
}




export const makeInterviewerAuthController = () => {
  return new InterviewerAuthController(
    makeActivateInterviewerUseCase(),
    makeLoginInterviewerUseCase(),
    makeVerifyInterviewerTokenUseCase()
  );
};
