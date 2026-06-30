import { IStudentRepository } from "@domain/repositories/IStudentRepository";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";

export interface IToggleStudentStatusUseCase {
    execute(studentId: string, status: string, adminRole?: string): Promise<void>;
}
