import { IStudentRepository } from "@domain/repositories/IStudentRepository";
import { UserStatus } from "@domain/enums/user.status.enum";
import { InviteStudentsDto } from "@application/dtos/auth/student/Request/InviteStudents.dto";
import { IEmailService } from "@application/services/IEmailService";
import { v4 as uuidv4 } from "uuid";
import { Student } from "@domain/entities/student";
import { CrossRoleAuthService } from "@application/services/CrossRoleAuthService";

export interface IBulkInviteStudentsUseCase {
  execute(collegeId: string, dto: InviteStudentsDto): Promise<any>;
}

export class BulkInviteStudentsUseCase implements IBulkInviteStudentsUseCase {
  constructor(
    private readonly _studentRepository: IStudentRepository,
    private readonly _emailService: IEmailService,
    private readonly _crossRoleAuthService: CrossRoleAuthService
  ) { }

  async execute(collegeId: string, dto: InviteStudentsDto): Promise<any> {
    const results = {
      invited: 0,
      skipped: 0,
      errors: [] as string[],
    };

    for (const studentData of dto.students) {
      try {
        const globalCheck = await this._crossRoleAuthService.isEmailInUse(studentData.email);
        if (globalCheck.inUse) {
          results.errors.push(`Email ${studentData.email} is already registered as a ${globalCheck.role}`);
          continue;
        }

        const exists = await this._studentRepository.existsByEmail(studentData.email);
        if (exists) {
          results.skipped++;
          continue;
        }

        const invitationToken = uuidv4();
        const invitationExpiresAt = new Date();
        invitationExpiresAt.setDate(invitationExpiresAt.getDate() + 7); // 7 days expiration

        const student = Student.create({
          firstName: studentData.firstName,
          lastName: studentData.lastName,
          email: studentData.email,
          password: "", // No password yet
          status: UserStatus.PENDING_INVITE,
          collegeId: collegeId,
          isFirstLogin: true,
          rollNumber: studentData.rollNumber,
          department: studentData.department,
          invitationToken,
          invitationExpiresAt,
        });

        await this._studentRepository.create(student);

        // Send invitation email
        const setupLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/student/setup?token=${invitationToken}`;
        await this._emailService.sendStudentInvitationEmail(student.email, setupLink);

        results.invited++;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        results.errors.push(`Failed to invite ${studentData.email}: ${errorMessage}`);
      }
    }

    return results;
  }
}
