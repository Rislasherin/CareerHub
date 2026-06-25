import { IStudentRepository } from "@domain/repositories/IStudentRepository";
import { IHRUserRepository } from "@domain/repositories/IHRUserRepository";
import { IInterviewerRepository } from "@domain/repositories/IInterviewerRepository";
import { ICollegeAdminRepository } from "@domain/repositories/ICollegeAdminRepository";
import { ISuperAdminRepository } from "@domain/repositories/ISuperAdminRepository";
import { IJwtService } from "@application/interfaces/IJwt.service";
import { IBcryptService } from "@application/interfaces/IBcryptService";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";

export interface IResetPasswordUseCase {
  execute(token: string, newPassword: string): Promise<void>;
}

export class ResetPasswordUseCase implements IResetPasswordUseCase {
  constructor(
    private readonly jwtService: IJwtService,
    private readonly bcryptService: IBcryptService,
    private readonly studentRepo: IStudentRepository,
    private readonly hrRepo: IHRUserRepository,
    private readonly interviewerRepo: IInterviewerRepository,
    private readonly collegeAdminRepo: ICollegeAdminRepository,
    private readonly superAdminRepo: ISuperAdminRepository
  ) { }

  async execute(token: string, newPassword: string): Promise<void> {
    // 1. Verify token
    const decoded = this.jwtService.verifyResetToken(token);
    if (!decoded || !decoded.id || !decoded.role) {
      throw new AppError("Invalid or expired reset token", HttpStatus.BAD_REQUEST, ErrorCode.INVALID_TOKEN);
    }

    const { id, role } = decoded;
    const hashedPassword = await this.bcryptService.hash(newPassword);

    // 2. Update password in the correct repository
    let updated = false;

    switch (role) {
      case 'student':
        await this.studentRepo.update(id, { password: hashedPassword } as any);
        updated = true;
        break;
      case 'hr':
        await this.hrRepo.update(id, { password: hashedPassword } as any);
        updated = true;
        break;
      case 'interviewer':
        await this.interviewerRepo.update(id, { password: hashedPassword } as any);
        updated = true;
        break;
      case 'college_admin':
        await this.collegeAdminRepo.update(id, { password: hashedPassword } as any);
        updated = true;
        break;
      case 'super_admin':
        await this.superAdminRepo.update(id, { password: hashedPassword } as any);
        updated = true;
        break;
    }

    if (!updated) {
      throw new AppError("User not found", HttpStatus.NOT_FOUND, ErrorCode.USER_NOT_FOUND);
    }
  }
}
