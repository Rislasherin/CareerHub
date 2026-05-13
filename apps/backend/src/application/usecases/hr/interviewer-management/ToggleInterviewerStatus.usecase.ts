import { IInterviewerRepository } from "@domain/repositories/IInterviewerRepository";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { UserStatus } from "@domain/enums/user.status.enum";

export interface IToggleInterviewerStatusUseCase {
  execute(interviewerId: string, companyId: string): Promise<void>;
}

export class ToggleInterviewerStatusUseCase implements IToggleInterviewerStatusUseCase {
  constructor(private readonly _interviewerRepository: IInterviewerRepository) {}

  async execute(interviewerId: string, companyId: string): Promise<void> {
    const interviewer = await this._interviewerRepository.findById(interviewerId);
    
    if (!interviewer) {
      throw new AppError("Interviewer not found", HttpStatus.NOT_FOUND, ErrorCode.USER_NOT_FOUND);
    }

    if (interviewer.companyId !== companyId) {
      throw new AppError("Unauthorized action", HttpStatus.FORBIDDEN, ErrorCode.UNAUTHORIZED);
    }

    // Toggle logic
    if (interviewer.status === UserStatus.ACTIVE) {
      interviewer.status = UserStatus.BLOCKED;
    } else if (interviewer.status === UserStatus.BLOCKED) {
      interviewer.status = UserStatus.ACTIVE;
    } else {
      throw new AppError("Cannot toggle status of pending interviewer", HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
    }

    await this._interviewerRepository.update(interviewerId, interviewer);
  }
}
