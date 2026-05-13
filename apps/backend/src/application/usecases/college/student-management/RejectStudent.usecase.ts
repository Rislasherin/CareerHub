import { IStudentRepository } from "@domain/repositories/IStudentRepository";
import { UserStatus } from "@domain/enums/user.status.enum";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";

import { Student } from "@domain/entities/student";

export interface IRejectStudentUseCase {
  execute(studentId: string, reason: string): Promise<void>;
}

export class RejectStudentUseCase implements IRejectStudentUseCase {
  constructor(private readonly _studentRepository: IStudentRepository) {}

  async execute(studentId: string, reason: string): Promise<void> {
    const student = await this._studentRepository.findById(studentId);
    if (!student) {
      throw new AppError("Student not found", HttpStatus.NOT_FOUND, ErrorCode.INTERNAL_ERROR);
    }

    const validStatuses = [UserStatus.PENDING, UserStatus.ACCESS_REQUESTED, UserStatus.PENDING_VERIFICATION];
    if (!validStatuses.includes(student.status)) {
      throw new AppError("Student is not in a rejectable status", HttpStatus.BAD_REQUEST, ErrorCode.INTERNAL_ERROR);
    }

    const updatedStudent = Student.create({
      ...student.toJSON(),
      status: UserStatus.REJECTED,
      rejectReason: reason,
    });

    await this._studentRepository.update(studentId, updatedStudent);
  }
}
