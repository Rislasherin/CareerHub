import { IEmailService } from "@application/services/IEmailService";
import { IJwtService } from "@application/interfaces/IJwt.service";
import { IStudentRepository } from "@domain/repositories/IStudentRepository";
import { IHRUserRepository } from "@domain/repositories/IHRUserRepository";
import { IInterviewerRepository } from "@domain/repositories/IInterviewerRepository";
import { ICollegeAdminRepository } from "@domain/repositories/ICollegeAdminRepository";
import { ISuperAdminRepository } from "@domain/repositories/ISuperAdminRepository";

import { env } from "@infrastructure/config/env.validator";

export interface IForgotPasswordUseCase {
  execute(email: string): Promise<void>;
}
