import { LoginStudentUseCase } from "@application/usecases/auth/student/implementations/login.student.usecase";
import { RegisterStudentUseCase } from "@application/usecases/auth/student/implementations/register.student.usecase";
import { bcryptService, jwtService, studentRepository } from "@infrastructure/di/infra.container";
import { StudentAuthController } from "@presentation/http/controllers/auth/student/student.auth.controller";

export const makeLoginStudentUseCase = () => {
  return new LoginStudentUseCase(studentRepository, jwtService, bcryptService);
};

export const makeRegisterStudentUseCase = () => {
  return new RegisterStudentUseCase(studentRepository, bcryptService);
};

export const makeStudentAuthController = () => {
  return new StudentAuthController(
    makeLoginStudentUseCase(),
    makeRegisterStudentUseCase()
  );
};
