"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerifyInterviewerTokenUseCase = void 0;
const user_status_enum_1 = require("@domain/enums/user.status.enum");
const AppError_1 = require("@application/errors/AppError");
const HttpStatus_enum_1 = require("@domain/enums/HttpStatus.enum");
const ErrorCodes_enum_1 = require("@domain/enums/ErrorCodes.enum");
class VerifyInterviewerTokenUseCase {
    constructor(_interviewerRepository, _jwtService) {
        this._interviewerRepository = _interviewerRepository;
        this._jwtService = _jwtService;
    }
    async execute(token) {
        try {
            const decoded = this._jwtService.verifyAccessToken(token);
            if (decoded.type !== "SETUP") {
                throw new AppError_1.AppError("Invalid token type", HttpStatus_enum_1.HttpStatus.BAD_REQUEST, ErrorCodes_enum_1.ErrorCode.INTERNAL_ERROR);
            }
            const interviewer = await this._interviewerRepository.findById(decoded.id);
            if (!interviewer) {
                throw new AppError_1.AppError("Interviewer not found", HttpStatus_enum_1.HttpStatus.NOT_FOUND, ErrorCodes_enum_1.ErrorCode.USER_NOT_FOUND);
            }
            if (interviewer.status !== user_status_enum_1.UserStatus.PENDING) {
                throw new AppError_1.AppError("Account already activated", HttpStatus_enum_1.HttpStatus.BAD_REQUEST, ErrorCodes_enum_1.ErrorCode.INTERNAL_ERROR);
            }
            return {
                firstName: interviewer.firstName,
                lastName: interviewer.lastName,
                email: interviewer.email,
            };
        }
        catch (error) {
            if (error instanceof AppError_1.AppError)
                throw error;
            throw new AppError_1.AppError("Invalid or expired token", HttpStatus_enum_1.HttpStatus.BAD_REQUEST, ErrorCodes_enum_1.ErrorCode.INTERNAL_ERROR);
        }
    }
}
exports.VerifyInterviewerTokenUseCase = VerifyInterviewerTokenUseCase;
