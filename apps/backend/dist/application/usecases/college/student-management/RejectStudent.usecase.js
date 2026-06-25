"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RejectStudentUseCase = void 0;
const user_status_enum_1 = require("@domain/enums/user.status.enum");
const AppError_1 = require("@application/errors/AppError");
const HttpStatus_enum_1 = require("@domain/enums/HttpStatus.enum");
const ErrorCodes_enum_1 = require("@domain/enums/ErrorCodes.enum");
const student_1 = require("@domain/entities/student");
class RejectStudentUseCase {
    constructor(_studentRepository) {
        this._studentRepository = _studentRepository;
    }
    async execute(studentId, reason) {
        const student = await this._studentRepository.findById(studentId);
        if (!student) {
            throw new AppError_1.AppError("Student not found", HttpStatus_enum_1.HttpStatus.NOT_FOUND, ErrorCodes_enum_1.ErrorCode.INTERNAL_ERROR);
        }
        const validStatuses = [user_status_enum_1.UserStatus.PENDING, user_status_enum_1.UserStatus.ACCESS_REQUESTED, user_status_enum_1.UserStatus.PENDING_VERIFICATION];
        if (!validStatuses.includes(student.status)) {
            throw new AppError_1.AppError("Student is not in a rejectable status", HttpStatus_enum_1.HttpStatus.BAD_REQUEST, ErrorCodes_enum_1.ErrorCode.INTERNAL_ERROR);
        }
        const updatedStudent = student_1.Student.create({
            ...student.toJSON(),
            status: user_status_enum_1.UserStatus.REJECTED,
            rejectReason: reason,
        });
        await this._studentRepository.update(studentId, updatedStudent);
    }
}
exports.RejectStudentUseCase = RejectStudentUseCase;
