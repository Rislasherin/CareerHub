import { InvalidCredentialsError, UnauthorizedError } from "@application/errors/AuthError";
import { StudentLoginRequestDto } from "@application/dtos/auth/student/Request/login.student.request.dto";
import { StudentLoginResponseDto } from "@application/dtos/auth/student/Response/login.student.response.dto";
import { ILoginStudentUsescase } from "@application/usecases/auth/student/interfaces/ILogin.student.usecase";
import { IStudentRepository } from "@domain/repositories/IStudentRepository";
import { IJwtService } from "@application/interfaces/IJwt.service";
import { IBcryptService } from "@application/interfaces/IBcryptService";
import { UserStatus } from "@domain/enums/user.status.enum";
import { Role } from "@domain/enums/Roles.enum";
import { CrossRoleAuthService } from "@application/services/CrossRoleAuthService";

export class LoginStudentUseCase implements ILoginStudentUsescase {
  constructor(
    private readonly _studentRepository: IStudentRepository,
    private readonly _jwtService: IJwtService,
    private readonly _bcryptService: IBcryptService,
    private readonly _crossRoleAuthService: CrossRoleAuthService
  ) {}

  async execute(dto: StudentLoginRequestDto): Promise<StudentLoginResponseDto> {
    const student = await this._studentRepository.findByEmail(dto.email);

    if (!student) {
      const globalCheck = await this._crossRoleAuthService.isEmailInUse(dto.email);
      if (globalCheck.inUse) {
        throw new UnauthorizedError(`This email is registered as a ${globalCheck.role}. Please use the correct login portal.`);
      }
      throw new InvalidCredentialsError();
    }

    const allowedStatuses = [UserStatus.ACTIVE, UserStatus.PENDING_VERIFICATION, UserStatus.REJECTED];
    if (!allowedStatuses.includes(student.status)) {
      if (student.status === UserStatus.BLOCKED) {
        throw new UnauthorizedError("Your account has been blocked by admin.");
      }
      throw new UnauthorizedError(`Account is ${student.status.toLowerCase().replace('_', ' ')}. Please contact support.`);
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
