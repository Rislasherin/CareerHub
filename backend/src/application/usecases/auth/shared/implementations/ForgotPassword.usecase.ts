import { IEmailService } from "@application/services/IEmailService";
import { IJwtService } from "@application/interfaces/IJwt.service";
import { IStudentRepository } from "@domain/repositories/IStudentRepository";
import { IHRUserRepository } from "@domain/repositories/IHRUserRepository";
import { IInterviewerRepository } from "@domain/repositories/IInterviewerRepository";
import { ICollegeAdminRepository } from "@domain/repositories/ICollegeAdminRepository";
import { ISuperAdminRepository } from "@domain/repositories/ISuperAdminRepository";

import { env } from "@infrastructure/config/env.validator";
import { IForgotPasswordUseCase } from "../interfaces/IForgotPassword.usecase";

export class ForgotPasswordUseCase implements IForgotPasswordUseCase {
  constructor(
    private readonly emailService: IEmailService,
    private readonly jwtService: IJwtService,
    private readonly studentRepo: IStudentRepository,
    private readonly hrRepo: IHRUserRepository,
    private readonly interviewerRepo: IInterviewerRepository,
    private readonly collegeAdminRepo: ICollegeAdminRepository,
    private readonly superAdminRepo: ISuperAdminRepository
  ) { }

  async execute(email: string): Promise<void> {
    let user: unknown = null;
    let role: string = '';

    user = await this.studentRepo.findByEmail(email);
    if (user) role = 'student';

    if (!user) {
      user = await this.hrRepo.findByEmail(email);
      if (user) role = 'hr';
    }

    if (!user) {
      user = await this.interviewerRepo.findByEmail(email);
      if (user) role = 'interviewer';
    }

    if (!user) {
      user = await this.collegeAdminRepo.findByEmail(email);
      if (user) role = 'college_admin';
    }

    if (!user) {
      user = await this.superAdminRepo.findByEmail(email);
      if (user) role = 'super_admin';
    }
    if (!user) return;
    const u = user as { id?: string, _id?: string, email: string };
    const resetToken = this.jwtService.generateResetToken({
      id: u.id || u._id!,
      email: u.email,
      role
    });
    const resetLink = `${env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    await this.emailService.sendPasswordResetEmail(email, resetLink);
  }
}

