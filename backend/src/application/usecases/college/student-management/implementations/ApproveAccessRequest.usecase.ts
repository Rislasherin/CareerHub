import { IStudentRepository } from "@domain/repositories/IStudentRepository";
import { UserStatus } from "@domain/enums/user.status.enum";
import { IEmailService } from "@application/services/IEmailService";
import { v4 as uuidv4 } from "uuid";
import { Student } from "@domain/entities/student";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { IApproveAccessRequestUseCase } from "../interfaces/IApproveAccessRequest.usecase";

export class ApproveAccessRequestUseCase implements IApproveAccessRequestUseCase {
  constructor(
    private readonly _studentRepository: IStudentRepository,
    private readonly _emailService: IEmailService
  ) {}

  async execute(studentId: string): Promise<void> {
    const student = await this._studentRepository.findById(studentId);
    if (!student) {
      throw new AppError("Student not found", HttpStatus.NOT_FOUND, ErrorCode.INTERNAL_ERROR);
    }

    if (student.status !== UserStatus.ACCESS_REQUESTED) {
      throw new AppError("Student is not in ACCESS_REQUESTED status", HttpStatus.BAD_REQUEST, ErrorCode.INTERNAL_ERROR);
    }

    const invitationToken = uuidv4();
    const invitationExpiresAt = new Date();
    invitationExpiresAt.setDate(invitationExpiresAt.getDate() + 7);

    const updatedStudent = Student.create({
      ...student.toJSON(),
      status: UserStatus.PENDING_INVITE,
      invitationToken,
      invitationExpiresAt,
    });

    await this._studentRepository.update(studentId, updatedStudent);

    const setupLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/student/setup?token=${invitationToken}`;
    await this._emailService.sendStudentInvitationEmail(student.email, setupLink);
  }
}

