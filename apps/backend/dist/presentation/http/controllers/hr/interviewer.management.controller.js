"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InterviewerManagementController = void 0;
const asyncHandler_util_1 = require("@shared/utils/asyncHandler.util");
const response_util_1 = require("@shared/utils/response.util");
const HttpStatus_enum_1 = require("@domain/enums/HttpStatus.enum");
const AppError_1 = require("@application/errors/AppError");
const ErrorCodes_enum_1 = require("@domain/enums/ErrorCodes.enum");
class InterviewerManagementController {
    constructor(addUseCase, getUseCase, toggleUseCase) {
        this.addUseCase = addUseCase;
        this.getUseCase = getUseCase;
        this.toggleUseCase = toggleUseCase;
        this.addInterviewer = (0, asyncHandler_util_1.asyncHandler)(async (req, res) => {
            const companyId = req.user?.companyId;
            if (!companyId) {
                throw new AppError_1.AppError("Company ID not found in session", HttpStatus_enum_1.HttpStatus.UNAUTHORIZED, ErrorCodes_enum_1.ErrorCode.UNAUTHORIZED);
            }
            const { firstName, lastName, email } = req.body;
            await this.addUseCase.execute(companyId, firstName, lastName, email);
            (0, response_util_1.sendSuccess)(res, null, "Interviewer added and setup email sent successfully", HttpStatus_enum_1.HttpStatus.CREATED);
        });
        this.getInterviewers = (0, asyncHandler_util_1.asyncHandler)(async (req, res) => {
            const companyId = req.user?.companyId;
            if (!companyId) {
                throw new AppError_1.AppError("Company ID not found in session", HttpStatus_enum_1.HttpStatus.UNAUTHORIZED, ErrorCodes_enum_1.ErrorCode.UNAUTHORIZED);
            }
            const { query = "", page = 1, limit = 10 } = req.query;
            const result = await this.getUseCase.execute(companyId, query, Number(page), Number(limit));
            (0, response_util_1.sendSuccess)(res, result, "Interviewers retrieved successfully");
        });
        this.toggleStatus = (0, asyncHandler_util_1.asyncHandler)(async (req, res) => {
            const companyId = req.user?.companyId;
            if (!companyId) {
                throw new AppError_1.AppError("Company ID not found in session", HttpStatus_enum_1.HttpStatus.UNAUTHORIZED, ErrorCodes_enum_1.ErrorCode.UNAUTHORIZED);
            }
            const { interviewerId } = req.params;
            await this.toggleUseCase.execute(interviewerId, companyId);
            (0, response_util_1.sendSuccess)(res, null, "Interviewer status updated successfully");
        });
    }
}
exports.InterviewerManagementController = InterviewerManagementController;
