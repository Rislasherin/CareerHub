"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToggleStudentStatusUseCase = void 0;
const AppError_1 = require("@application/errors/AppError");
const HttpStatus_enum_1 = require("@domain/enums/HttpStatus.enum");
const ErrorCodes_enum_1 = require("@domain/enums/ErrorCodes.enum");
class ToggleStudentStatusUseCase {
    constructor(studentRepo) {
        this.studentRepo = studentRepo;
    }
    async execute(studentId, status, adminRole) {
        console.log(`USECASE: Toggling student ${studentId} to ${status} by ${adminRole}`);
        const student = await this.studentRepo.findById(studentId);
        if (!student) {
            console.log(`USECASE Error: Student ${studentId} not found`);
            throw new AppError_1.AppError("Student not found", HttpStatus_enum_1.HttpStatus.NOT_FOUND, ErrorCodes_enum_1.ErrorCode.NOT_FOUND);
        }
        console.log(`USECASE: Current status is ${student.status}, setting to ${status}`);
        await this.studentRepo.updateStatus(studentId, status, adminRole);
        console.log(`USECASE: Update command sent for ${studentId}`);
    }
}
exports.ToggleStudentStatusUseCase = ToggleStudentStatusUseCase;
