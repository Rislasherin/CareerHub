"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BulkInviteStudentsUseCase = void 0;
const user_status_enum_1 = require("@domain/enums/user.status.enum");
const uuid_1 = require("uuid");
const student_1 = require("@domain/entities/student");
class BulkInviteStudentsUseCase {
    constructor(_studentRepository, _emailService) {
        this._studentRepository = _studentRepository;
        this._emailService = _emailService;
    }
    async execute(collegeId, dto) {
        const results = {
            invited: 0,
            skipped: 0,
            errors: [],
        };
        for (const studentData of dto.students) {
            try {
                const exists = await this._studentRepository.existsByEmail(studentData.email);
                if (exists) {
                    results.skipped++;
                    continue;
                }
                const invitationToken = (0, uuid_1.v4)();
                const invitationExpiresAt = new Date();
                invitationExpiresAt.setDate(invitationExpiresAt.getDate() + 7); // 7 days expiration
                const student = student_1.Student.create({
                    firstName: studentData.firstName,
                    lastName: studentData.lastName,
                    email: studentData.email,
                    password: "", // No password yet
                    status: user_status_enum_1.UserStatus.PENDING_INVITE,
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
            }
            catch (error) {
                results.errors.push(`Failed to invite ${studentData.email}: ${error.message}`);
            }
        }
        return results;
    }
}
exports.BulkInviteStudentsUseCase = BulkInviteStudentsUseCase;
