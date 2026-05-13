import { ActivateInterviewerUseCase } from "@application/usecases/auth/interviewer/implementations/ActivateInterviewer.usecase";
import { interviewerRepository, bcryptService, jwtService, crossRoleAuthService } from "@infrastructure/di/infra.container";
import { InterviewerAuthController } from "@presentation/http/controllers/auth/interviewer/interviewer.auth.controller";

import { LoginInterviewerUseCase } from "@application/usecases/auth/interviewer/implementations/LoginInterviewer.usecase";

import { VerifyInterviewerTokenUseCase } from "@application/usecases/auth/interviewer/implementations/VerifyInterviewerToken.usecase";

export const makeActivateInterviewerUseCase = () => {
  return new ActivateInterviewerUseCase(interviewerRepository, bcryptService, jwtService);
};

export const makeLoginInterviewerUseCase = () => {
  return new LoginInterviewerUseCase(interviewerRepository, jwtService, bcryptService, crossRoleAuthService);
};

export const makeVerifyInterviewerTokenUseCase = () => {
  return new VerifyInterviewerTokenUseCase(interviewerRepository, jwtService);
};

export const makeInterviewerAuthController = () => {
  return new InterviewerAuthController(
    makeActivateInterviewerUseCase(),
    makeLoginInterviewerUseCase(),
    makeVerifyInterviewerTokenUseCase()
  );
};
