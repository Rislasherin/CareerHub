"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApproveAccessRequestUseCase = void 0;
const user_status_enum_1 = require("@domain/enums/user.status.enum");
const uuid_1 = require("uuid");
const student_1 = require("@domain/entities/student");
const AppError_1 = require("@application/errors/AppError");
const HttpStatus_enum_1 = require("@domain/enums/HttpStatus.enum");
const ErrorCodes_enum_1 = require("@domain/enums/ErrorCodes.enum");
class ApproveAccessRequestUseCase {
    constructor(_studentRepository, _emailService) {
        this._studentRepository = _studentRepository;
        this._emailService = _emailService;
    }
    async execute(studentId) {
        const student = await this._studentRepository.findById(studentId);
        if (!student) {
            throw new AppError_1.AppError("Student not found", HttpStatus_enum_1.HttpStatus.NOT_FOUND, ErrorCodes_enum_1.ErrorCode.INTERNAL_ERROR);
        }
        if (student.status !== user_status_enum_1.UserStatus.ACCESS_REQUESTED) {
            throw new AppError_1.AppError("Student is not in ACCESS_REQUESTED status", HttpStatus_enum_1.HttpStatus.BAD_REQUEST, ErrorCodes_enum_1.ErrorCode.INTERNAL_ERROR);
        }
        const invitationToken = (0, uuid_1.v4)();
        const invitationExpiresAt = new Date();
        invitationExpiresAt.setDate(invitationExpiresAt.getDate() + 7);
        const updatedStudent = student_1.Student.create({
            ...student.toJSON(),
            status: user_status_enum_1.UserStatus.PENDING_INVITE,
            invitationToken,
            invitationExpiresAt,
        });
        await this._studentRepository.update(studentId, updatedStudent);
        const setupLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/student/setup?token=${invitationToken}`;
        await this._emailService.sendStudentInvitationEmail(student.email, setupLink);
    }
}
exports.ApproveAccessRequestUseCase = ApproveAccessRequestUseCase;
