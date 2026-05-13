"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetupStudentPasswordUseCase = void 0;
const user_status_enum_1 = require("@domain/enums/user.status.enum");
const AppError_1 = require("@application/errors/AppError");
const HttpStatus_enum_1 = require("@domain/enums/HttpStatus.enum");
const ErrorCodes_enum_1 = require("@domain/enums/ErrorCodes.enum");
const student_1 = require("@domain/entities/student");
const Roles_enum_1 = require("@domain/enums/Roles.enum");
class SetupStudentPasswordUseCase {
    constructor(_studentRepository, _bcryptService, _jwtService) {
        this._studentRepository = _studentRepository;
        this._bcryptService = _bcryptService;
        this._jwtService = _jwtService;
    }
    async execute(token, password) {
        const student = await this._studentRepository.findByInvitationToken(token);
        if (!student) {
            throw new AppError_1.AppError("Invalid or expired invitation token", HttpStatus_enum_1.HttpStatus.BAD_REQUEST, ErrorCodes_enum_1.ErrorCode.INTERNAL_ERROR);
        }
        if (student.invitationExpiresAt && student.invitationExpiresAt < new Date()) {
            throw new AppError_1.AppError("Invitation link has expired", HttpStatus_enum_1.HttpStatus.BAD_REQUEST, ErrorCodes_enum_1.ErrorCode.INTERNAL_ERROR);
        }
        if (student.status !== user_status_enum_1.UserStatus.PENDING_INVITE) {
            throw new AppError_1.AppError("Account is not in a state that allows setup", HttpStatus_enum_1.HttpStatus.BAD_REQUEST, ErrorCodes_enum_1.ErrorCode.INTERNAL_ERROR);
        }
        const hashedPassword = await this._bcryptService.hash(password);
        const updatedStudent = student_1.Student.create({
            ...student.toJSON(),
            password: hashedPassword,
            status: user_status_enum_1.UserStatus.PENDING_VERIFICATION,
            invitationToken: undefined,
            invitationExpiresAt: undefined,
            isFirstLogin: false,
        });
        await this._studentRepository.update(student.id, updatedStudent);
        const payload = {
            id: student.id,
            role: Roles_enum_1.Role.STUDENT,
            orgId: student.collegeId,
        };
        return {
            accessToken: this._jwtService.signAccessToken(payload),
            refreshToken: this._jwtService.signRefreshToken(payload),
            user: {
                id: student.id,
                firstName: student.firstName,
                lastName: student.lastName,
                email: student.email,
                role: Roles_enum_1.Role.STUDENT,
                status: user_status_enum_1.UserStatus.PENDING_VERIFICATION,
            }
        };
    }
}
exports.SetupStudentPasswordUseCase = SetupStudentPasswordUseCase;
