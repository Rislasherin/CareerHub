"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddInterviewerUseCase = void 0;
const Interviewer_1 = require("@domain/entities/Interviewer");
const user_status_enum_1 = require("@domain/enums/user.status.enum");
const Roles_enum_1 = require("@domain/enums/Roles.enum");
const AppError_1 = require("@application/errors/AppError");
const HttpStatus_enum_1 = require("@domain/enums/HttpStatus.enum");
const ErrorCodes_enum_1 = require("@domain/enums/ErrorCodes.enum");
const env_validator_1 = require("@infrastructure/config/env.validator");
class AddInterviewerUseCase {
    constructor(_interviewerRepository, _emailService, _jwtService, _crossRoleAuthService) {
        this._interviewerRepository = _interviewerRepository;
        this._emailService = _emailService;
        this._jwtService = _jwtService;
        this._crossRoleAuthService = _crossRoleAuthService;
    }
    async execute(comptypeId, firstName, lastName, email) {
        const globalCheck = await this._crossRoleAuthService.isEmailInUse(email);
        if (globalCheck.inUse) {
            throw new AppError_1.AppError(`This email is already registered as a ${globalCheck.role}`, HttpStatus_enum_1.HttpStatus.BAD_REQUEST, ErrorCodes_enum_1.ErrorCode.USER_ALREADY_EXISTS);
        }
        const existing = await this._interviewerRepository.findByEmail(email);
        if (existing) {
            throw new AppError_1.AppError("Interviewer with this email already exists", HttpStatus_enum_1.HttpStatus.BAD_REQUEST, ErrorCodes_enum_1.ErrorCode.USER_ALREADY_EXISTS);
        }
        const interviewer = await this._interviewerRepository.create(Interviewer_1.Interviewer.create({
            comptypeId,
            firstName,
            lastName,
            email,
            password: "PENDING_SETUP",
            designation: "Interviewer",
            specialization: "General",
            role: Roles_enum_1.Role.INTERVIEWER,
            status: user_status_enum_1.UserStatus.PENDING,
        }));
        const setupToken = this._jwtService.signAccessToken({
            id: interviewer.id,
            role: Roles_enum_1.Role.INTERVIEWER,
            type: "SETUP"
        });
        const setupLink = `${env_validator_1.env.FRONTEND_URL}/interviewer/setup?token=${setupToken}&email=${encodeURIComponent(email)}`;
        await this._emailService.sendInterviewerSetupEmail(email, setupLink);
    }
}
exports.AddInterviewerUseCase = AddInterviewerUseCase;
