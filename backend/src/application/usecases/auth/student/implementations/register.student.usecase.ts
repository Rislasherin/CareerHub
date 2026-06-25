import { IRegisterStudentUseCase } from "../interfaces/IRegister.student.usecase";
import { IStudentRepository } from "@domain/repositories/IStudentRepository";
import { IBcryptService } from "@application/interfaces/IBcryptService";
import { RegisterStudentRequestDto } from "@application/dtos/auth/student/Request/register.student.request.dto";
import { Student } from "@domain/entities/student";
import { UserStatus } from "@domain/enums/user.status.enum";
import { AppError } from "@application/errors/AppError";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";

export class RegisterStudentUseCase implements IRegisterStudentUseCase {
  constructor(
    private readonly _studentRepository: IStudentRepository,
    private readonly _bcryptService: IBcryptService
  ) {}

  async execute(dto: RegisterStudentRequestDto): Promise<void> {
    const exists = await this._studentRepository.existsByEmail(dto.email);
    if (exists) {
      throw new AppError(
        "Student with this email already exists",
        HttpStatus.BAD_REQUEST,
        ErrorCode.USER_ALREADY_EXISTS
      );
    }

    const hashedPassword = await this._bcryptService.hash(dto.password);

    const student = Student.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      password: hashedPassword,
      status: UserStatus.PENDING,
      collegeId: dto.collegeId,
      proofUrl: dto.proofUrl,
      isFirstLogin: true,
    });

    await this._studentRepository.create(student);
  }
}
