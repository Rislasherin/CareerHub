import { IInterviewerRepository } from "@domain/repositories/IInterviewerRepository";
import { IEmailService } from "@application/services/IEmailService";
import { Interviewer } from "@domain/entities/Interviewer";
import { UserStatus } from "@domain/enums/user.status.enum";
import { Role } from "@domain/enums/Roles.enum";
import { IJwtService } from "@application/interfaces/IJwt.service";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { CrossRoleAuthService } from "@application/services/CrossRoleAuthService";

import { env } from "@infrastructure/config/env.validator";

export interface IAddInterviewerUseCase {
  execute(companyId: string, firstName: string, lastName: string, email: string): Promise<void>;
}

export class AddInterviewerUseCase implements IAddInterviewerUseCase {
  constructor(
    private readonly _interviewerRepository: IInterviewerRepository,
    private readonly _emailService: IEmailService,
    private readonly _jwtService: IJwtService,
    private readonly _crossRoleAuthService: CrossRoleAuthService
  ) {}

  async execute(companyId: string, firstName: string, lastName: string, email: string) {
    const globalCheck = await this._crossRoleAuthService.isEmailInUse(email);
    if (globalCheck.inUse) {
      throw new AppError(`This email is already registered as a ${globalCheck.role}`, HttpStatus.BAD_REQUEST, ErrorCode.USER_ALREADY_EXISTS);
    }

    const existing = await this._interviewerRepository.findByEmail(email);
    if (existing) {
      throw new AppError("Interviewer with this email already exists", HttpStatus.BAD_REQUEST, ErrorCode.USER_ALREADY_EXISTS);
    }

    const interviewer = await this._interviewerRepository.create(
      Interviewer.create({
        companyId,
        firstName,
        lastName,
        email,
        password: "PENDING_SETUP",
        designation: "Interviewer",
        specialization: "General",
        role: Role.INTERVIEWER,
        status: UserStatus.PENDING,
      })
    );

    const setupToken = this._jwtService.signAccessToken({
      id: interviewer.id!,
      role: Role.INTERVIEWER,
      type: "SETUP"
    });

    const setupLink = `${env.FRONTEND_URL}/interviewer/setup?token=${setupToken}&email=${encodeURIComponent(email)}`;

    await this._emailService.sendInterviewerSetupEmail(email, setupLink);
  }
}
