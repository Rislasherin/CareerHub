import { IStudentRepository } from "@domain/repositories/IStudentRepository";
import { IOrganizationRepository } from "@domain/repositories/IOrganizationRepository";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { IGetStudentFullProfileUseCase } from "../interfaces/IGetStudentFullProfile.usecase";

export class GetStudentFullProfileUseCase implements IGetStudentFullProfileUseCase {
  constructor(
    private readonly _studentRepository: IStudentRepository,
    private readonly _organizationRepository: IOrganizationRepository
  ) {}

  async execute(studentId: string): Promise<Record<string, unknown>> {
    const student = await this._studentRepository.findById(studentId);
    if (!student) {
      throw new AppError("Resource not found", HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }

    const studentData = student.toJSON() as unknown as Record<string, unknown>;
    try {
      if (student.collegeId) {
        const org = await this._organizationRepository.findById(student.collegeId.toString());
        if (org) {
          studentData.collegeName = org.name;
        }
      }
    } catch (err) {}

    return studentData;
  }
}
