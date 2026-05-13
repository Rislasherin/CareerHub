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

export class UploadStudentVerificationUseCase implements IUploadStudentVerificationUseCase {
  constructor(
    private readonly _studentRepository: IStudentRepository,
    private readonly _storageService: IStorageService
  ) {}

  async execute(studentId: string, file: any): Promise<Student> {
    const student = await this._studentRepository.findById(studentId);
    if (!student) {
      throw new AppError("Student not found", HttpStatus.NOT_FOUND, ErrorCode.INTERNAL_ERROR);
    }

    if (student.status !== UserStatus.PENDING_VERIFICATION && student.status !== UserStatus.REJECTED) {
      throw new AppError("Verification details cannot be uploaded at this stage", HttpStatus.BAD_REQUEST, ErrorCode.INTERNAL_ERROR);
    }

    const proofUrl = await this._storageService.uploadFile(file, `student-verifications/${studentId}`);

    const updatedStudent = Student.create({
      ...student.toJSON(),
      proofUrl,
      status: UserStatus.PENDING_VERIFICATION, // Reset status if it was rejected
    });

    await this._studentRepository.update(studentId, updatedStudent);
    return updatedStudent;
  }
}
