import { IStudentRepository } from "@domain/repositories/IStudentRepository";
import { UserStatus } from "@domain/enums/user.status.enum";
import { IEmailService } from "@application/services/IEmailService";
import { v4 as uuidv4 } from "uuid";
import { Student } from "@domain/entities/student";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { IResendStudentInvitationUseCase } from "../interfaces/IResendStudentInvitation.usecase";
import { env } from "@infrastructure/config/env.validator";

export class ResendStudentInvitationUseCase implements IResendStudentInvitationUseCase {
  constructor(
    private readonly _studentRepository: IStudentRepository,
    private readonly _emailService: IEmailService
  ) {}

  async execute(studentId: string, orgId: string): Promise<void> {
    const student = await this._studentRepository.findById(studentId);
    if (!student) {
      throw new AppError("Student not found", HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }

    if (student.collegeId !== orgId) {
      throw new AppError("Unauthorized access to student record", HttpStatus.FORBIDDEN, ErrorCode.FORBIDDEN);
    }

    // Only allow resending invitation for students who have not set up their accounts yet
    if (student.status !== UserStatus.PENDING_INVITE) {
      throw new AppError("Invitation can only be resent for pending students", HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
    }

    // Generate new invitation token and expiry
    const invitationToken = uuidv4();
    const invitationExpiresAt = new Date();
    invitationExpiresAt.setDate(invitationExpiresAt.getDate() + 7);

    const updatedStudent = Student.create({
      ...student.toJSON(),
      invitationToken,
      invitationExpiresAt,
    });

    await this._studentRepository.update(studentId, updatedStudent);

    // Resend email
    const setupLink = `${env.FRONTEND_URL}/student/setup?token=${invitationToken}`;
    await this._emailService.sendStudentInvitationEmail(student.email, setupLink);
  }
}
