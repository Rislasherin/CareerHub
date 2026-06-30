import { IStudentRepository } from "@domain/repositories/IStudentRepository";
import { UserStatus } from "@domain/enums/user.status.enum";
import { RequestAccessDto } from "@application/dtos/auth/student/Request/RequestAccess.dto";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { Student } from "@domain/entities/student";

import { IRequestAccessUseCase } from "../interfaces/IRequestAccess.usecase";

export class RequestAccessUseCase implements IRequestAccessUseCase {
  constructor(private readonly _studentRepository: IStudentRepository) {}

  async execute(dto: RequestAccessDto): Promise<void> {
    const exists = await this._studentRepository.existsByEmail(dto.email);
    if (exists) {
      throw new AppError("A student with this email already exists", HttpStatus.CONFLICT, ErrorCode.INTERNAL_ERROR);
    }

    const student = Student.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      password: "", // No password yet
      status: UserStatus.ACCESS_REQUESTED,
      collegeId: dto.collegeId,
      isFirstLogin: true,
      rollNumber: dto.rollNumber,
      department: dto.department,
      phoneNumber: dto.phoneNumber,
    });

    await this._studentRepository.create(student);
  }
}
