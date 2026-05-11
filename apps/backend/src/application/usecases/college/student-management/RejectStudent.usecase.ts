import { IStudentRepository } from "@domain/repositories/IStudentRepository";
import { UserStatus } from "@domain/enums/user.status.enum";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";

export interface IRejectStudentUseCase {
  execute(studentId: string): Promise<void>;
}

export class RejectStudentUseCase implements IRejectStudentUseCase {
  constructor(private readonly _studentRepository: IStudentRepository) {}

  async execute(studentId: string): Promise<void> {
    const student = await this._studentRepository.findById(studentId);
    if (!student) {
      throw new AppError("Student not found", HttpStatus.NOT_FOUND, ErrorCode.INTERNAL_ERROR);
    }

    if (student.status !== UserStatus.PENDING) {
      throw new AppError("Student is not in pending status", HttpStatus.BAD_REQUEST, ErrorCode.INTERNAL_ERROR);
    }

    // When rejecting, we can either set status to BLOCKED or just DELETE the student.
    // For now, let's just set it to BLOCKED or a new status REJECTED if we want.
    // Let's use BLOCKED for simplicity.
    await this._studentRepository.updateStatus(studentId, UserStatus.BLOCKED);
  }
}
