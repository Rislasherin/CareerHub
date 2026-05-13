"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestAccessUseCase = void 0;
const user_status_enum_1 = require("@domain/enums/user.status.enum");
const AppError_1 = require("@application/errors/AppError");
const HttpStatus_enum_1 = require("@domain/enums/HttpStatus.enum");
const ErrorCodes_enum_1 = require("@domain/enums/ErrorCodes.enum");
const student_1 = require("@domain/entities/student");
class RequestAccessUseCase {
    constructor(_studentRepository) {
        this._studentRepository = _studentRepository;
    }
    async execute(dto) {
        const exists = await this._studentRepository.existsByEmail(dto.email);
        if (exists) {
            throw new AppError_1.AppError("A student with this email already exists", HttpStatus_enum_1.HttpStatus.CONFLICT, ErrorCodes_enum_1.ErrorCode.INTERNAL_ERROR);
        }
        const student = student_1.Student.create({
            firstName: dto.firstName,
            lastName: dto.lastName,
            email: dto.email,
            password: "", // No password yet
            status: user_status_enum_1.UserStatus.ACCESS_REQUESTED,
            collegeId: dto.collegeId,
            isFirstLogin: true,
            rollNumber: dto.rollNumber,
            department: dto.department,
            phoneNumber: dto.phoneNumber,
        });
        await this._studentRepository.create(student);
    }
}
exports.RequestAccessUseCase = RequestAccessUseCase;
