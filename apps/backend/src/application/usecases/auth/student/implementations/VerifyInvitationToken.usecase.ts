import { IStudentRepository } from "@domain/repositories/IStudentRepository";
import { UserStatus } from "@domain/enums/user.status.enum";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";

export interface IVerifyInvitationTokenUseCase {
  execute(token: string): Promise<any>;
}

export class VerifyInvitationTokenUseCase implements IVerifyInvitationTokenUseCase {
  constructor(private readonly _studentRepository: IStudentRepository) { }

  async execute(token: string): Promise<any> {
    const student = await this._studentRepository.findByInvitationToken(token);

    if (!student) {
      throw new AppError("Invalid or expired invitation token", HttpStatus.BAD_REQUEST, ErrorCode.INTERNAL_ERROR);
    }

    if (student.invitationExpiresAt && student.invitationExpiresAt < new Date()) {
      throw new AppError("Invitation link has expired", HttpStatus.BAD_REQUEST, ErrorCode.INTERNAL_ERROR);
    }

    if (student.status !== UserStatus.PENDING_INVITE) {
      throw new AppError("Account is already setup", HttpStatus.BAD_REQUEST, ErrorCode.INTERNAL_ERROR);
    }

    return {
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
    };
  }
}
