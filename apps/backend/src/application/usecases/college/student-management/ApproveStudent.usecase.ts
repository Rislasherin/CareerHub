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

    if (student.status !== UserStatus.PENDING_VERIFICATION) {
      throw new AppError("Student has not completed verification setup", HttpStatus.BAD_REQUEST, ErrorCode.INTERNAL_ERROR);
    }

    if (!student.proofUrl) {
      throw new AppError("Student must upload an ID proof document before they can be approved", HttpStatus.BAD_REQUEST, ErrorCode.INTERNAL_ERROR);
    }

    await this._studentRepository.updateStatus(studentId, UserStatus.ACTIVE);
  }
}
