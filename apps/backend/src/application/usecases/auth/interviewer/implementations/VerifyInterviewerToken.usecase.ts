import { IInterviewerRepository } from "@domain/repositories/IInterviewerRepository";
import { UserStatus } from "@domain/enums/user.status.enum";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { IJwtService } from "@application/interfaces/IJwt.service";

export interface IVerifyInterviewerTokenUseCase {
  execute(token: string): Promise<any>;
}

export class VerifyInterviewerTokenUseCase implements IVerifyInterviewerTokenUseCase {
  constructor(
    private readonly _interviewerRepository: IInterviewerRepository,
    private readonly _jwtService: IJwtService
  ) { }

  async execute(token: string): Promise<any> {
    try {
      const decoded = this._jwtService.verifyAccessToken(token) as any;
      if (decoded.type !== "SETUP") {
        throw new AppError("Invalid token type", HttpStatus.BAD_REQUEST, ErrorCode.INTERNAL_ERROR);
      }

      const interviewer = await this._interviewerRepository.findById(decoded.id);
      if (!interviewer) {
        throw new AppError("Interviewer not found", HttpStatus.NOT_FOUND, ErrorCode.USER_NOT_FOUND);
      }

      if (interviewer.status !== UserStatus.PENDING) {
        throw new AppError("Account already activated", HttpStatus.BAD_REQUEST, ErrorCode.INTERNAL_ERROR);
      }

      return {
        firstName: interviewer.firstName,
        lastName: interviewer.lastName,
        email: interviewer.email,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Invalid or expired token", HttpStatus.BAD_REQUEST, ErrorCode.INTERNAL_ERROR);
    }
  }
}
