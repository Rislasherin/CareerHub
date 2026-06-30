import { Student } from "@domain/entities/student";
import { IStudentRepository } from "@domain/repositories/IStudentRepository";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { UpdateStudentProfileDto } from "@application/dtos/student/UpdateStudentProfile.dto";

export interface IUpdateStudentProfileUseCase {
  execute(studentId: string, dto: UpdateStudentProfileDto): Promise<Student>;
}
