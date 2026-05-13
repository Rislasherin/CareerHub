"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApproveStudentUseCase = void 0;
const user_status_enum_1 = require("@domain/enums/user.status.enum");
const AppError_1 = require("@application/errors/AppError");
const HttpStatus_enum_1 = require("@domain/enums/HttpStatus.enum");
const ErrorCodes_enum_1 = require("@domain/enums/ErrorCodes.enum");
class ApproveStudentUseCase {
    constructor(_studentRepository) {
        this._studentRepository = _studentRepository;
    }
    async execute(studentId) {
        const student = await this._studentRepository.findById(studentId);
        if (!student) {
            throw new AppError_1.AppError("Student not found", HttpStatus_enum_1.HttpStatus.NOT_FOUND, ErrorCodes_enum_1.ErrorCode.INTERNAL_ERROR);
        }
        if (student.status !== user_status_enum_1.UserStatus.PENDING_VERIFICATION) {
            throw new AppError_1.AppError("Student has not completed verification setup", HttpStatus_enum_1.HttpStatus.BAD_REQUEST, ErrorCodes_enum_1.ErrorCode.INTERNAL_ERROR);
        }
        await this._studentRepository.updateStatus(studentId, user_status_enum_1.UserStatus.ACTIVE);
    }
}
exports.ApproveStudentUseCase = ApproveStudentUseCase;
