import { IInterviewerRepository } from "@domain/repositories/IInterviewerRepository";
import { IBcryptService } from "@application/interfaces/IBcryptService";
import { UserStatus } from "@domain/enums/user.status.enum";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { Interviewer } from "@domain/entities/Interviewer";
import { IJwtService } from "@application/interfaces/IJwt.service";

export interface IActivateInterviewerUseCase {
  execute(interviewerId: string, password: string, email?: string): Promise<any>;
}

export class ActivateInterviewerUseCase implements IActivateInterviewerUseCase {
  constructor(
    private readonly _interviewerRepository: IInterviewerRepository,
    private readonly _bcryptService: IBcryptService,
    private readonly _jwtService: IJwtService
  ) { }

  async execute(interviewerId: string, password: string, emailFromQuery?: string) {
    console.log(`[ACTIVATE] Attempting to activate interviewer. ID: ${interviewerId}, Email: ${emailFromQuery}`);

    let interviewer = await this._interviewerRepository.findById(interviewerId);

    if (interviewer) {
      console.log(`[ACTIVATE] Found interviewer by ID: ${interviewer.email}`);
    }

    // Backup: Search by email if ID lookup fails
    if (!interviewer && emailFromQuery) {
      console.log(`[ACTIVATE] ID lookup failed, searching by email: ${emailFromQuery}`);
      interviewer = await this._interviewerRepository.findByEmail(emailFromQuery);
      if (interviewer) {
        console.log(`[ACTIVATE] Found interviewer by fallback email: ${interviewer.id}`);
      }
    }

    if (!interviewer) {
      console.error(`[ACTIVATE] Interviewer not found. Received ID: ${interviewerId}, Received Email Query: ${emailFromQuery}`);
      const identifier = emailFromQuery || interviewerId;
      throw new AppError(`Interviewer (${identifier}) not found. Please ask your admin to resend the invite.`, HttpStatus.NOT_FOUND, ErrorCode.USER_NOT_FOUND);
    }

    if (interviewer.status !== UserStatus.PENDING) {
      throw new AppError("Account is already active or not in pending state", HttpStatus.BAD_REQUEST, ErrorCode.INTERNAL_ERROR);
    }

    const hashedPassword = await this._bcryptService.hash(password);

    const updatedInterviewer = Interviewer.create({
      ...interviewer.toJSON(),
      password: hashedPassword,
      status: UserStatus.ACTIVE,
    });

    await this._interviewerRepository.update(interviewer.id!, updatedInterviewer);

    const payload = {
      id: updatedInterviewer.id!,
      role: updatedInterviewer.role,
      companyId: updatedInterviewer.companyId,
    };

    const accessToken = this._jwtService.signAccessToken(payload);
    const refreshToken = this._jwtService.signRefreshToken(payload);

    return {
      accessToken,
      refreshToken,
      user: {
        id: updatedInterviewer.id,
        firstName: updatedInterviewer.firstName,
        lastName: updatedInterviewer.lastName,
        email: updatedInterviewer.email,
        role: updatedInterviewer.role,
      },
    };
  }
}
