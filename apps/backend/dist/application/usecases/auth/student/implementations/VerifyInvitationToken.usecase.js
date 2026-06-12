"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerifyInvitationTokenUseCase = void 0;
const user_status_enum_1 = require("@domain/enums/user.status.enum");
const AppError_1 = require("@application/errors/AppError");
const HttpStatus_enum_1 = require("@domain/enums/HttpStatus.enum");
const ErrorCodes_enum_1 = require("@domain/enums/ErrorCodes.enum");
class VerifyInvitationTokenUseCase {
    constructor(_studentRepository) {
        this._studentRepository = _studentRepository;
    }
    async execute(token) {
        const student = await this._studentRepository.findByInvitationToken(token);
        if (!student) {
            throw new AppError_1.AppError("Invalid or expired invitation token", HttpStatus_enum_1.HttpStatus.BAD_REQUEST, ErrorCodes_enum_1.ErrorCode.INTERNAL_ERROR);
        }
        if (student.invitationExpiresAt && student.invitationExpiresAt < new Date()) {
            throw new AppError_1.AppError("Invitation link has expired", HttpStatus_enum_1.HttpStatus.BAD_REQUEST, ErrorCodes_enum_1.ErrorCode.INTERNAL_ERROR);
        }
        if (student.status !== user_status_enum_1.UserStatus.PENDING_INVITE) {
            throw new AppError_1.AppError("Account is already setup", HttpStatus_enum_1.HttpStatus.BAD_REQUEST, ErrorCodes_enum_1.ErrorCode.INTERNAL_ERROR);
        }
        return {
            firstName: student.firstName,
            lastName: student.lastName,
            email: student.email,
        };
    }
}
exports.VerifyInvitationTokenUseCase = VerifyInvitationTokenUseCase;
