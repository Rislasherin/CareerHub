"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestoreInterviewerUseCase = void 0;
const AppError_1 = require("@application/errors/AppError");
const HttpStatus_enum_1 = require("@domain/enums/HttpStatus.enum");
const ErrorCodes_enum_1 = require("@domain/enums/ErrorCodes.enum");
const user_status_enum_1 = require("@domain/enums/user.status.enum");
const Interviewer_1 = require("@domain/entities/Interviewer");
class RestoreInterviewerUseCase {
    constructor(_interviewerRepository) {
        this._interviewerRepository = _interviewerRepository;
    }
    async execute(companyId, interviewerId) {
        const interviewer = await this._interviewerRepository.findDeletedById(interviewerId);
        if (!interviewer) {
            throw new AppError_1.AppError("Soft-deleted interviewer not found", HttpStatus_enum_1.HttpStatus.NOT_FOUND, ErrorCodes_enum_1.ErrorCode.USER_NOT_FOUND);
        }
        if (interviewer.companyId !== companyId) {
            throw new AppError_1.AppError("Unauthorized: Interviewer does not belong to your company", HttpStatus_enum_1.HttpStatus.UNAUTHORIZED, ErrorCodes_enum_1.ErrorCode.UNAUTHORIZED);
        }
        // Reconstruct the interviewer domain entity with status ACTIVE and isDeleted false
        const currentProps = interviewer.toJSON();
        const restoredInterviewer = Interviewer_1.Interviewer.create({
            ...currentProps,
            status: user_status_enum_1.UserStatus.ACTIVE,
            isDeleted: false,
        });
        // Remove the soft delete flag in the database
        await this._interviewerRepository.restore(interviewerId);
        // Save the status and isDeleted update back to Mongoose
        await this._interviewerRepository.update(interviewerId, restoredInterviewer);
    }
}
exports.RestoreInterviewerUseCase = RestoreInterviewerUseCase;
