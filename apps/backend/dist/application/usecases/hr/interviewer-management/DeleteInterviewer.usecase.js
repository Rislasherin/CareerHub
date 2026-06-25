"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteInterviewerUseCase = void 0;
const AppError_1 = require("@application/errors/AppError");
const HttpStatus_enum_1 = require("@domain/enums/HttpStatus.enum");
const ErrorCodes_enum_1 = require("@domain/enums/ErrorCodes.enum");
const user_status_enum_1 = require("@domain/enums/user.status.enum");
class DeleteInterviewerUseCase {
    constructor(_interviewerRepository) {
        this._interviewerRepository = _interviewerRepository;
    }
    async execute(companyId, interviewerId) {
        const interviewer = await this._interviewerRepository.findById(interviewerId);
        if (!interviewer) {
            throw new AppError_1.AppError("Interviewer not found", HttpStatus_enum_1.HttpStatus.NOT_FOUND, ErrorCodes_enum_1.ErrorCode.USER_NOT_FOUND);
        }
        if (interviewer.companyId !== companyId) {
            throw new AppError_1.AppError("Unauthorized: Interviewer does not belong to your company", HttpStatus_enum_1.HttpStatus.UNAUTHORIZED, ErrorCodes_enum_1.ErrorCode.UNAUTHORIZED);
        }
        // Set the status to BLOCKED so that authentication checks reject them instantly
        interviewer.status = user_status_enum_1.UserStatus.BLOCKED;
        await this._interviewerRepository.update(interviewerId, interviewer);
        // Call repository delete (which performs Mongoose soft delete { isDeleted: true })
        await this._interviewerRepository.delete(interviewerId);
    }
}
exports.DeleteInterviewerUseCase = DeleteInterviewerUseCase;
