import { IInterviewerRepository } from "@domain/repositories/IInterviewerRepository";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { Interviewer } from "@domain/entities/Interviewer";
import { IUpdateInterviewerUseCase } from "../interfaces/IUpdateInterviewer.usecase";

export class UpdateInterviewerUseCase implements IUpdateInterviewerUseCase {
  constructor(private readonly _interviewerRepository: IInterviewerRepository) { }

  async execute(
    companyId: string,
    interviewerId: string,
    updates: {
      firstName?: string;
      lastName?: string;
      designation?: string;
      specialization?: string;
    }
  ): Promise<void> {
    const interviewer = await this._interviewerRepository.findById(interviewerId);
    if (!interviewer) {
      throw new AppError("Interviewer not found", HttpStatus.NOT_FOUND, ErrorCode.USER_NOT_FOUND);
    }

    if (interviewer.companyId !== companyId) {
      throw new AppError("Unauthorized: Interviewer does not belong to your company", HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
    }

    const currentProps = interviewer.toJSON();
    const updatedInterviewer = Interviewer.create({
      ...currentProps,
      firstName: updates.firstName !== undefined ? updates.firstName : currentProps.firstName,
      lastName: updates.lastName !== undefined ? updates.lastName : currentProps.lastName,
      designation: updates.designation !== undefined ? updates.designation : currentProps.designation,
      specialization: updates.specialization !== undefined ? updates.specialization : currentProps.specialization,
    });

    await this._interviewerRepository.update(interviewerId, updatedInterviewer);
  }
}

