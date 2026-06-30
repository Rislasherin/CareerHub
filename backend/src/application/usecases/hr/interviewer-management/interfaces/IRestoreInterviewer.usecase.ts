import { IInterviewerRepository } from "@domain/repositories/IInterviewerRepository";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { UserStatus } from "@domain/enums/user.status.enum";
import { Interviewer } from "@domain/entities/Interviewer";

export interface IRestoreInterviewerUseCase {
  execute(companyId: string, interviewerId: string): Promise<void>;
}
