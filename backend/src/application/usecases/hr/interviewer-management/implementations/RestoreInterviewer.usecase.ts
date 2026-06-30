import { IInterviewerRepository } from "@domain/repositories/IInterviewerRepository";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { UserStatus } from "@domain/enums/user.status.enum";
import { Interviewer } from "@domain/entities/Interviewer";
import { IRestoreInterviewerUseCase } from "../interfaces/IRestoreInterviewer.usecase";

export class RestoreInterviewerUseCase implements IRestoreInterviewerUseCase {
  constructor(private readonly _interviewerRepository: IInterviewerRepository) { }

  async execute(companyId: string, interviewerId: string): Promise<void> {
    const interviewer = await this._interviewerRepository.findDeletedById(interviewerId);
    if (!interviewer) {
      throw new AppError("Soft-deleted interviewer not found", HttpStatus.NOT_FOUND, ErrorCode.USER_NOT_FOUND);
    }

    if (interviewer.companyId !== companyId) {
      throw new AppError("Unauthorized: Interviewer does not belong to your company", HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
    }

    // Reconstruct the interviewer domain entity with status ACTIVE and isDeleted false
    const currentProps = interviewer.toJSON();
    const restoredInterviewer = Interviewer.create({
      ...currentProps,
      status: UserStatus.ACTIVE,
      isDeleted: false,
    });

    // Remove the soft delete flag in the database
    await this._interviewerRepository.restore(interviewerId);

    // Save the status and isDeleted update back to Mongoose
    await this._interviewerRepository.update(interviewerId, restoredInterviewer);
  }
}

