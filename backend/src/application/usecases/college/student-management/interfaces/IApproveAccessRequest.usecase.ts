import { IStudentRepository } from "@domain/repositories/IStudentRepository";
import { UserStatus } from "@domain/enums/user.status.enum";
import { IEmailService } from "@application/services/IEmailService";
import { v4 as uuidv4 } from "uuid";
import { Student } from "@domain/entities/student";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";

export interface IApproveAccessRequestUseCase {
  execute(studentId: string): Promise<void>;
}
