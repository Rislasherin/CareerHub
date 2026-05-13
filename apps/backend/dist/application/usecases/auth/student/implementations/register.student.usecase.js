"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterStudentUseCase = void 0;
const student_1 = require("@domain/entities/student");
const user_status_enum_1 = require("@domain/enums/user.status.enum");
const AppError_1 = require("@application/errors/AppError");
const ErrorCodes_enum_1 = require("@domain/enums/ErrorCodes.enum");
const HttpStatus_enum_1 = require("@domain/enums/HttpStatus.enum");
class RegisterStudentUseCase {
    constructor(_studentRepository, _bcryptService) {
        this._studentRepository = _studentRepository;
        this._bcryptService = _bcryptService;
    }
    async execute(dto) {
        const exists = await this._studentRepository.existsByEmail(dto.email);
        if (exists) {
            throw new AppError_1.AppError("Student with this email already exists", HttpStatus_enum_1.HttpStatus.BAD_REQUEST, ErrorCodes_enum_1.ErrorCode.USER_ALREADY_EXISTS);
        }
        const hashedPassword = await this._bcryptService.hash(dto.password);
        const student = student_1.Student.create({
            firstName: dto.firstName,
            lastName: dto.lastName,
            email: dto.email,
            password: hashedPassword,
            status: user_status_enum_1.UserStatus.PENDING,
            collegeId: dto.collegeId,
            proofUrl: dto.proofUrl,
            isFirstLogin: true,
        });
        await this._studentRepository.create(student);
    }
}
exports.RegisterStudentUseCase = RegisterStudentUseCase;
