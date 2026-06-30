import { IStudentRepository } from "@domain/repositories/IStudentRepository";
import { UserStatus } from "@domain/enums/user.status.enum";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";

import { Student } from "@domain/entities/student";

export interface IRejectStudentUseCase {
  execute(studentId: string, reason: string): Promise<void>;
}
