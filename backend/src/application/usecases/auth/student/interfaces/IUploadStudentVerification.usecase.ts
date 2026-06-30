import { IStudentRepository } from "@domain/repositories/IStudentRepository";
import { UserStatus } from "@domain/enums/user.status.enum";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { Student } from "@domain/entities/student";

import { IStorageService } from "@application/interfaces/IStorageService";

export interface IUploadStudentVerificationUseCase {
  execute(studentId: string, file: any): Promise<Student>;
}
