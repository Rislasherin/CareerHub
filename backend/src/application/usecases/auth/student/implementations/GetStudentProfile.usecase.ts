import { IStudentRepository } from "@domain/repositories/IStudentRepository";
import { Student } from "@domain/entities/student";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";

export interface IGetStudentProfileUseCase {
  execute(studentId: string): Promise<any>;
}

export class GetStudentProfileUseCase implements IGetStudentProfileUseCase {
  constructor(private readonly _studentRepository: IStudentRepository) { }

  async execute(studentId: string): Promise<any> {
    const student = await this._studentRepository.findById(studentId);
    if (!student) {
      throw new AppError("Student not found", HttpStatus.NOT_FOUND, ErrorCode.INTERNAL_ERROR);
    }

    return {
      id: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      status: student.status,
      rollNumber: student.rollNumber,
      department: student.department,
      proofUrl: student.proofUrl,
      rejectReason: student.rejectReason,
    };
  }
}
