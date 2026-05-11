import { InvalidCredentialsError, UnauthorizedError } from "@application/errors/AuthError";
import { StudentLoginRequestDto } from "@application/dtos/auth/student/Request/login.student.request.dto";
import { StudentLoginResponseDto } from "@application/dtos/auth/student/Response/login.student.response.dto";
import { ILoginStudentUsescase } from "@application/usecases/auth/student/interfaces/ILogin.student.usecase";
import { IStudentRepository } from "@domain/repositories/IStudentRepository";
import { IJwtService } from "@application/interfaces/IJwt.service";
import { IBcryptService } from "@application/interfaces/IBcryptService";
import { UserStatus } from "@domain/enums/user.status.enum";
import { Role } from "@domain/enums/Roles.enum";

export class LoginStudentUseCase implements ILoginStudentUsescase {
  constructor(
    private readonly _studentRepository: IStudentRepository,
    private readonly _jwtService: IJwtService,
    private readonly _bcryptService: IBcryptService
  ) {}

  async execute(dto: StudentLoginRequestDto): Promise<StudentLoginResponseDto> {
    const student = await this._studentRepository.findByEmail(dto.email);

    if (!student) {
      throw new InvalidCredentialsError();
    }

    if (student.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedError();
    }

    const isPasswordValid = await this._bcryptService.compare(dto.password, student.password);

    if (!isPasswordValid) {
      throw new InvalidCredentialsError();
    }

    const payload = {
      id: student.id ?? "",
      role: Role.STUDENT,
      orgId: student.toJSON().collegeId,
    };

    return {
      accessToken: this._jwtService.signAccessToken(payload),
      refreshToken: this._jwtService.signRefreshToken(payload),
      student: {
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        status: student.status,
        isFirstLogin: student.isFirstLogin,
      },
    };
  }
}
