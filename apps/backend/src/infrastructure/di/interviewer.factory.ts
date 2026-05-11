import { ActivateInterviewerUseCase } from "@application/usecases/auth/interviewer/implementations/ActivateInterviewer.usecase";
import { interviewerRepository, bcryptService } from "@infrastructure/di/infra.container";
import { InterviewerAuthController } from "@presentation/http/controllers/auth/interviewer/interviewer.auth.controller";

export const makeActivateInterviewerUseCase = () => {
  return new ActivateInterviewerUseCase(interviewerRepository, bcryptService);
};

export const makeInterviewerAuthController = () => {
  return new InterviewerAuthController(makeActivateInterviewerUseCase());
};
