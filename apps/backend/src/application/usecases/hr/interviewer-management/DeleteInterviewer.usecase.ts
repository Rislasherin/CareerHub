import { IInterviewerRepository } from "@domain/repositories/IInterviewerRepository";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { UserStatus } from "@domain/enums/user.status.enum";

export interface IDeleteInterviewerUseCase {
  execute(companyId: string, interviewerId: string): Promise<void>;
}

export class DeleteInterviewerUseCase implements IDeleteInterviewerUseCase {
  constructor(private readonly _interviewerRepository: IInterviewerRepository) {}

  async execute(companyId: string, interviewerId: string): Promise<void> {
    const interviewer = await this._interviewerRepository.findById(interviewerId);
    if (!interviewer) {
      throw new AppError("Interviewer not found", HttpStatus.NOT_FOUND, ErrorCode.USER_NOT_FOUND);
    }

    if (interviewer.companyId !== companyId) {
      throw new AppError("Unauthorized: Interviewer does not belong to your company", HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
    }

    // Set the status to BLOCKED so that authentication checks reject them instantly
    interviewer.status = UserStatus.BLOCKED;
    await this._interviewerRepository.update(interviewerId, interviewer);

    // Call repository delete (which performs Mongoose soft delete { isDeleted: true })
    await this._interviewerRepository.delete(interviewerId);
  }
}
