import { IStudentRepository } from "@domain/repositories/IStudentRepository";
import { UserStatus } from "@domain/enums/user.status.enum";
import { IBcryptService } from "@application/interfaces/IBcryptService";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { Student } from "@domain/entities/student";
import { IJwtService } from "@application/interfaces/IJwt.service";
import { Role } from "@domain/enums/Roles.enum";

import { ISetupStudentPasswordUseCase, SetupPasswordResponse } from "../interfaces/ISetupStudentPassword.usecase";

export class SetupStudentPasswordUseCase implements ISetupStudentPasswordUseCase {
  constructor(
    private readonly _studentRepository: IStudentRepository,
    private readonly _bcryptService: IBcryptService,
    private readonly _jwtService: IJwtService
  ) { }

  async execute(token: string, password: string): Promise<SetupPasswordResponse> {
    const student = await this._studentRepository.findByInvitationToken(token);

    if (!student) {
      throw new AppError("Invalid or expired invitation token", HttpStatus.BAD_REQUEST, ErrorCode.INTERNAL_ERROR);
    }

    if (student.invitationExpiresAt && student.invitationExpiresAt < new Date()) {
      throw new AppError("Invitation link has expired", HttpStatus.BAD_REQUEST, ErrorCode.INTERNAL_ERROR);
    }

    if (student.status !== UserStatus.PENDING_INVITE) {
      throw new AppError("Account is not in a state that allows setup", HttpStatus.BAD_REQUEST, ErrorCode.INTERNAL_ERROR);
    }

    const hashedPassword = await this._bcryptService.hash(password);

    const updatedStudent = Student.create({
      ...student.toJSON(),
      password: hashedPassword,
      status: UserStatus.PENDING_VERIFICATION,
      invitationToken: undefined,
      invitationExpiresAt: undefined,
      isFirstLogin: false,
    });

    await this._studentRepository.update(student.id!, updatedStudent);

    const payload = {
      id: student.id!,
      role: Role.STUDENT,
      orgId: student.collegeId,
    };

    return {
      accessToken: this._jwtService.signAccessToken(payload),
      refreshToken: this._jwtService.signRefreshToken(payload),
      user: {
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        role: Role.STUDENT,
        status: UserStatus.PENDING_VERIFICATION,
      }
    };
  }
}
