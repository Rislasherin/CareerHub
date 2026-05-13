"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadStudentVerificationUseCase = void 0;
const user_status_enum_1 = require("@domain/enums/user.status.enum");
const AppError_1 = require("@application/errors/AppError");
const HttpStatus_enum_1 = require("@domain/enums/HttpStatus.enum");
const ErrorCodes_enum_1 = require("@domain/enums/ErrorCodes.enum");
const student_1 = require("@domain/entities/student");
class UploadStudentVerificationUseCase {
    constructor(_studentRepository) {
        this._studentRepository = _studentRepository;
    }
    async execute(studentId, proofUrl) {
        const student = await this._studentRepository.findById(studentId);
        if (!student) {
            throw new AppError_1.AppError("Student not found", HttpStatus_enum_1.HttpStatus.NOT_FOUND, ErrorCodes_enum_1.ErrorCode.INTERNAL_ERROR);
        }
        if (student.status !== user_status_enum_1.UserStatus.PENDING_VERIFICATION && student.status !== user_status_enum_1.UserStatus.REJECTED) {
            throw new AppError_1.AppError("Verification details cannot be uploaded at this stage", HttpStatus_enum_1.HttpStatus.BAD_REQUEST, ErrorCodes_enum_1.ErrorCode.INTERNAL_ERROR);
        }
        const updatedStudent = student_1.Student.create({
            ...student.toJSON(),
            proofUrl,
            status: user_status_enum_1.UserStatus.PENDING_VERIFICATION, // Reset status if it was rejected
        });
        await this._studentRepository.update(studentId, updatedStudent);
    }
}
exports.UploadStudentVerificationUseCase = UploadStudentVerificationUseCase;
