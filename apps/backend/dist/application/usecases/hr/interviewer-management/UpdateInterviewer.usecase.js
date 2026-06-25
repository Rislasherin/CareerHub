"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateInterviewerUseCase = void 0;
const AppError_1 = require("@application/errors/AppError");
const HttpStatus_enum_1 = require("@domain/enums/HttpStatus.enum");
const ErrorCodes_enum_1 = require("@domain/enums/ErrorCodes.enum");
const Interviewer_1 = require("@domain/entities/Interviewer");
class UpdateInterviewerUseCase {
    constructor(_interviewerRepository) {
        this._interviewerRepository = _interviewerRepository;
    }
    async execute(companyId, interviewerId, updates) {
        const interviewer = await this._interviewerRepository.findById(interviewerId);
        if (!interviewer) {
            throw new AppError_1.AppError("Interviewer not found", HttpStatus_enum_1.HttpStatus.NOT_FOUND, ErrorCodes_enum_1.ErrorCode.USER_NOT_FOUND);
        }
        if (interviewer.companyId !== companyId) {
            throw new AppError_1.AppError("Unauthorized: Interviewer does not belong to your company", HttpStatus_enum_1.HttpStatus.UNAUTHORIZED, ErrorCodes_enum_1.ErrorCode.UNAUTHORIZED);
        }
        const currentProps = interviewer.toJSON();
        const updatedInterviewer = Interviewer_1.Interviewer.create({
            ...currentProps,
            firstName: updates.firstName !== undefined ? updates.firstName : currentProps.firstName,
            lastName: updates.lastName !== undefined ? updates.lastName : currentProps.lastName,
            designation: updates.designation !== undefined ? updates.designation : currentProps.designation,
            specialization: updates.specialization !== undefined ? updates.specialization : currentProps.specialization,
        });
        await this._interviewerRepository.update(interviewerId, updatedInterviewer);
    }
}
exports.UpdateInterviewerUseCase = UpdateInterviewerUseCase;
