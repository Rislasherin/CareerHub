"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToggleInterviewerStatusUseCase = void 0;
const AppError_1 = require("@application/errors/AppError");
const HttpStatus_enum_1 = require("@domain/enums/HttpStatus.enum");
const ErrorCodes_enum_1 = require("@domain/enums/ErrorCodes.enum");
const user_status_enum_1 = require("@domain/enums/user.status.enum");
class ToggleInterviewerStatusUseCase {
    constructor(_interviewerRepository) {
        this._interviewerRepository = _interviewerRepository;
    }
    async execute(interviewerId, companyId) {
        const interviewer = await this._interviewerRepository.findById(interviewerId);
        if (!interviewer) {
            throw new AppError_1.AppError("Interviewer not found", HttpStatus_enum_1.HttpStatus.NOT_FOUND, ErrorCodes_enum_1.ErrorCode.USER_NOT_FOUND);
        }
        if (interviewer.companyId !== companyId) {
            throw new AppError_1.AppError("Unauthorized action", HttpStatus_enum_1.HttpStatus.FORBIDDEN, ErrorCodes_enum_1.ErrorCode.UNAUTHORIZED);
        }
        // Toggle logic
        if (interviewer.status === user_status_enum_1.UserStatus.ACTIVE) {
            interviewer.status = user_status_enum_1.UserStatus.BLOCKED;
        }
        else if (interviewer.status === user_status_enum_1.UserStatus.BLOCKED) {
            interviewer.status = user_status_enum_1.UserStatus.ACTIVE;
        }
        else {
            throw new AppError_1.AppError("Cannot toggle status of pending interviewer", HttpStatus_enum_1.HttpStatus.BAD_REQUEST, ErrorCodes_enum_1.ErrorCode.VALIDATION_ERROR);
        }
        await this._interviewerRepository.update(interviewerId, interviewer);
    }
}
exports.ToggleInterviewerStatusUseCase = ToggleInterviewerStatusUseCase;
