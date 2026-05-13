import { LoginStudentUseCase } from "@application/usecases/auth/student/implementations/login.student.usecase";
import { RegisterStudentUseCase } from "@application/usecases/auth/student/implementations/register.student.usecase";
import { 
  bcryptService, 
  jwtService, 
  studentRepository,
  hrUserRepository,
  interviewerRepository,
  collegeAdminRepository,
  superAdminRepository,
  crossRoleAuthService
} from "@infrastructure/di/infra.container";
import { StudentAuthController } from "@presentation/http/controllers/auth/student/student.auth.controller";
import { ForgotPasswordUseCase } from "@application/usecases/auth/shared/ForgotPassword.usecase";
import { ForgotPasswordController } from "@presentation/http/controllers/auth/ForgotPassword.controller";
import { EmailService } from "@infrastructure/services/email/email.service";

import { RequestAccessUseCase } from "@application/usecases/auth/student/implementations/RequestAccess.usecase";
import { SetupStudentPasswordUseCase } from "@application/usecases/auth/student/implementations/SetupStudentPassword.usecase";

import { GetStudentProfileUseCase } from "@application/usecases/auth/student/implementations/GetStudentProfile.usecase";
import { VerifyInvitationTokenUseCase } from "@application/usecases/auth/student/implementations/VerifyInvitationToken.usecase";

export const makeLoginStudentUseCase = () => {
  return new LoginStudentUseCase(studentRepository, jwtService, bcryptService, crossRoleAuthService);
};

export const makeRequestAccessUseCase = () => {
  return new RequestAccessUseCase(studentRepository);
};

export const makeSetupStudentPasswordUseCase = () => {
  return new SetupStudentPasswordUseCase(studentRepository, bcryptService, jwtService);
};

export const makeGetStudentProfileUseCase = () => {
  return new GetStudentProfileUseCase(studentRepository);
};

export const makeVerifyInvitationTokenUseCase = () => {
  return new VerifyInvitationTokenUseCase(studentRepository);
};

export const makeStudentAuthController = () => {
  return new StudentAuthController(
    makeLoginStudentUseCase(),
    makeRequestAccessUseCase(),
    makeSetupStudentPasswordUseCase(),
    makeGetStudentProfileUseCase(),
    makeVerifyInvitationTokenUseCase()
  );
};

import { ResetPasswordUseCase } from "@application/usecases/auth/shared/ResetPassword.usecase";

export const makeForgotPasswordController = () => {
  const emailService = new EmailService();
  const forgotPasswordUseCase = new ForgotPasswordUseCase(
    emailService,
    jwtService,
    studentRepository,
    hrUserRepository,
    interviewerRepository,
    collegeAdminRepository,
    superAdminRepository
  );
  const resetPasswordUseCase = new ResetPasswordUseCase(
    jwtService,
    bcryptService,
    studentRepository,
    hrUserRepository,
    interviewerRepository,
    collegeAdminRepository,
    superAdminRepository
  );
  return new ForgotPasswordController(forgotPasswordUseCase, resetPasswordUseCase);
};
