import { IInterviewerRepository } from "@domain/repositories/IInterviewerRepository";
import { IEmailService } from "@application/services/IEmailService";
import { UserStatus } from "@domain/enums/user.status.enum";
import { Role } from "@domain/enums/Roles.enum";
import { IJwtService } from "@application/interfaces/IJwt.service";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { env } from "@infrastructure/config/env.validator";

export class ResendInterviewerInviteUseCase {
  constructor(
    private readonly _interviewerRepository: IInterviewerRepository,
    private readonly _emailService: IEmailService,
    private readonly _jwtService: IJwtService
  ) {}

  async execute(interviewerId: string) {
    const interviewer = await this._interviewerRepository.findById(interviewerId);

    if (!interviewer) {
      throw new AppError("Interviewer not found", HttpStatus.NOT_FOUND, ErrorCode.USER_NOT_FOUND);
    }

    if (interviewer.status !== UserStatus.PENDING) {
      throw new AppError("Only pending interviewers can receive a resend link", HttpStatus.BAD_REQUEST, ErrorCode.INTERNAL_ERROR);
    }

    const setupToken = this._jwtService.signAccessToken({
      id: interviewer.id!,
      role: Role.INTERVIEWER,
      type: "SETUP"
    });

    const setupLink = `${env.FRONTEND_URL}/interviewer/setup?token=${setupToken}&email=${interviewer.email}`;

    await this._emailService.sendInterviewerSetupEmail(interviewer.email, setupLink);
  }
}
