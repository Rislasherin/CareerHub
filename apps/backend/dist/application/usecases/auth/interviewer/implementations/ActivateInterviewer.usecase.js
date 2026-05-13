"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivateInterviewerUseCase = void 0;
const user_status_enum_1 = require("@domain/enums/user.status.enum");
const AppError_1 = require("@application/errors/AppError");
const HttpStatus_enum_1 = require("@domain/enums/HttpStatus.enum");
const ErrorCodes_enum_1 = require("@domain/enums/ErrorCodes.enum");
const Interviewer_1 = require("@domain/entities/Interviewer");
class ActivateInterviewerUseCase {
    constructor(_interviewerRepository, _bcryptService, _jwtService) {
        this._interviewerRepository = _interviewerRepository;
        this._bcryptService = _bcryptService;
        this._jwtService = _jwtService;
    }
    async execute(interviewerId, password, emailFromQuery) {
        let interviewer = await this._interviewerRepository.findById(interviewerId);
        // Backup: Search by email if ID lookup fails
        if (!interviewer && emailFromQuery) {
            interviewer = await this._interviewerRepository.findByEmail(emailFromQuery);
        }
        if (!interviewer) {
            const identifier = emailFromQuery || interviewerId;
            throw new AppError_1.AppError(`Interviewer (${identifier}) not found. Please ask your admin to resend the invite.`, HttpStatus_enum_1.HttpStatus.NOT_FOUND, ErrorCodes_enum_1.ErrorCode.USER_NOT_FOUND);
        }
        if (interviewer.status !== user_status_enum_1.UserStatus.PENDING) {
            throw new AppError_1.AppError("Account is already active or not in pending state", HttpStatus_enum_1.HttpStatus.BAD_REQUEST, ErrorCodes_enum_1.ErrorCode.INTERNAL_ERROR);
        }
        const hashedPassword = await this._bcryptService.hash(password);
        const updatedInterviewer = Interviewer_1.Interviewer.create({
            ...interviewer.toJSON(),
            password: hashedPassword,
            status: user_status_enum_1.UserStatus.ACTIVE,
        });
        await this._interviewerRepository.update(interviewer.id, updatedInterviewer);
        const payload = {
            id: updatedInterviewer.id,
            role: updatedInterviewer.role,
            companyId: updatedInterviewer.companyId,
        };
        const accessToken = this._jwtService.signAccessToken(payload);
        const refreshToken = this._jwtService.signRefreshToken(payload);
        return {
            accessToken,
            refreshToken,
            user: {
                id: updatedInterviewer.id,
                firstName: updatedInterviewer.firstName,
                lastName: updatedInterviewer.lastName,
                email: updatedInterviewer.email,
                role: updatedInterviewer.role,
            },
        };
    }
}
exports.ActivateInterviewerUseCase = ActivateInterviewerUseCase;
