import { IInterviewerRepository } from "@domain/repositories/IInterviewerRepository";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { Interviewer } from "@domain/entities/Interviewer";

export interface IUpdateInterviewerUseCase {
  execute(
    companyId: string,
    interviewerId: string,
    updates: {
      firstName?: string;
      lastName?: string;
      designation?: string;
      specialization?: string;
    }
  ): Promise<void>;
}
