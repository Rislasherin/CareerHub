import { IStudentRepository } from "@domain/repositories/IStudentRepository";
import { UserStatus } from "@domain/enums/user.status.enum";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";

export interface IApproveStudentUseCase {
  execute(studentId: string): Promise<void>;
}

export class ApproveStudentUseCase implements IApproveStudentUseCase {
  constructor(private readonly _studentRepository: IStudentRepository) {}

  async execute(studentId: string): Promise<void> {
    const student = await this._studentRepository.findById(studentId);
    if (!student) {
      throw new AppError("Student not found", HttpStatus.NOT_FOUND, ErrorCode.INTERNAL_ERROR);
    }

    if (student.status !== UserStatus.PENDING) {
      throw new AppError("Student is not in pending status", HttpStatus.BAD_REQUEST, ErrorCode.INTERNAL_ERROR);
    }

    await this._studentRepository.updateStatus(studentId, UserStatus.ACTIVE);
  }
}
