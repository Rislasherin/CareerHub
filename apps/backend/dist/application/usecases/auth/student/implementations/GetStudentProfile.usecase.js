"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetStudentProfileUseCase = void 0;
const AppError_1 = require("@application/errors/AppError");
const HttpStatus_enum_1 = require("@domain/enums/HttpStatus.enum");
const ErrorCodes_enum_1 = require("@domain/enums/ErrorCodes.enum");
class GetStudentProfileUseCase {
    constructor(_studentRepository) {
        this._studentRepository = _studentRepository;
    }
    async execute(studentId) {
        const student = await this._studentRepository.findById(studentId);
        if (!student) {
            throw new AppError_1.AppError("Student not found", HttpStatus_enum_1.HttpStatus.NOT_FOUND, ErrorCodes_enum_1.ErrorCode.INTERNAL_ERROR);
        }
        return {
            id: student.id,
            firstName: student.firstName,
            lastName: student.lastName,
            email: student.email,
            status: student.status,
            rollNumber: student.rollNumber,
            department: student.department,
            proofUrl: student.proofUrl,
            rejectReason: student.rejectReason,
        };
    }
}
exports.GetStudentProfileUseCase = GetStudentProfileUseCase;
