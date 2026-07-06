import { IStudentRepository } from "@domain/repositories/IStudentRepository";
import { IGetCollegeNoticesUseCase } from "@application/usecases/college/notices/interfaces/IGetCollegeNotices.usecase";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { IGetStudentNoticesUseCase } from "../interfaces/IGetStudentNotices.usecase";

export class GetStudentNoticesUseCase implements IGetStudentNoticesUseCase {
  constructor(
    private readonly _studentRepository: IStudentRepository,
    private readonly _getCollegeNoticesUseCase: IGetCollegeNoticesUseCase
  ) {}

  async execute(studentId: string): Promise<any> {
    const student = await this._studentRepository.findById(studentId);
    if (!student || !student.collegeId) {
      throw new AppError("College not found for this student", HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }
    
    return this._getCollegeNoticesUseCase.execute(student.collegeId.toString());
  }
}
