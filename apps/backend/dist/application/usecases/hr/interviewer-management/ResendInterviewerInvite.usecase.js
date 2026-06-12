"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResendInterviewerInviteUseCase = void 0;
const user_status_enum_1 = require("@domain/enums/user.status.enum");
const Roles_enum_1 = require("@domain/enums/Roles.enum");
const AppError_1 = require("@application/errors/AppError");
const HttpStatus_enum_1 = require("@domain/enums/HttpStatus.enum");
const ErrorCodes_enum_1 = require("@domain/enums/ErrorCodes.enum");
const env_validator_1 = require("@infrastructure/config/env.validator");
class ResendInterviewerInviteUseCase {
    constructor(_interviewerRepository, _emailService, _jwtService) {
        this._interviewerRepository = _interviewerRepository;
        this._emailService = _emailService;
        this._jwtService = _jwtService;
    }
    async execute(interviewerId) {
        const interviewer = await this._interviewerRepository.findById(interviewerId);
        if (!interviewer) {
            throw new AppError_1.AppError("Interviewer not found", HttpStatus_enum_1.HttpStatus.NOT_FOUND, ErrorCodes_enum_1.ErrorCode.USER_NOT_FOUND);
        }
        if (interviewer.status !== user_status_enum_1.UserStatus.PENDING) {
            throw new AppError_1.AppError("Only pending interviewers can receive a resend link", HttpStatus_enum_1.HttpStatus.BAD_REQUEST, ErrorCodes_enum_1.ErrorCode.INTERNAL_ERROR);
        }
        const setupToken = this._jwtService.signAccessToken({
            id: interviewer.id,
            role: Roles_enum_1.Role.INTERVIEWER,
            type: "SETUP"
        });
        const setupLink = `${env_validator_1.env.FRONTEND_URL}/interviewer/setup?token=${setupToken}&email=${interviewer.email}`;
        await this._emailService.sendInterviewerSetupEmail(interviewer.email, setupLink);
    }
}
exports.ResendInterviewerInviteUseCase = ResendInterviewerInviteUseCase;
