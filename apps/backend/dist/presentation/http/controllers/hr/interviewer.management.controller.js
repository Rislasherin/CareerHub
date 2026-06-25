"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InterviewerManagementController = void 0;
const asyncHandler_util_1 = require("@shared/utils/asyncHandler.util");
const response_util_1 = require("@shared/utils/response.util");
const HttpStatus_enum_1 = require("@domain/enums/HttpStatus.enum");
const AppError_1 = require("@application/errors/AppError");
const ErrorCodes_enum_1 = require("@domain/enums/ErrorCodes.enum");
class InterviewerManagementController {
    constructor(_addUseCase, _getUseCase, _toggleUseCase, _resendUseCase, _updateUseCase, _deleteUseCase, _restoreUseCase) {
        this._addUseCase = _addUseCase;
        this._getUseCase = _getUseCase;
        this._toggleUseCase = _toggleUseCase;
        this._resendUseCase = _resendUseCase;
        this._updateUseCase = _updateUseCase;
        this._deleteUseCase = _deleteUseCase;
        this._restoreUseCase = _restoreUseCase;
        this.addInterviewer = (0, asyncHandler_util_1.asyncHandler)(async (req, res) => {
            const companyId = req.user?.companyId;
            if (!companyId) {
                throw new AppError_1.AppError("Company ID not found in session", HttpStatus_enum_1.HttpStatus.UNAUTHORIZED, ErrorCodes_enum_1.ErrorCode.UNAUTHORIZED);
            }
            const { firstName, lastName, email } = req.body;
            await this._addUseCase.execute(companyId, firstName, lastName, email);
            (0, response_util_1.sendSuccess)(res, null, "Interviewer added and setup email sent successfully", HttpStatus_enum_1.HttpStatus.CREATED);
        });
        this.getInterviewers = (0, asyncHandler_util_1.asyncHandler)(async (req, res) => {
            const companyId = req.user?.companyId;
            if (!companyId) {
                throw new AppError_1.AppError("Company ID not found in session", HttpStatus_enum_1.HttpStatus.UNAUTHORIZED, ErrorCodes_enum_1.ErrorCode.UNAUTHORIZED);
            }
            const { query = "", page = 1, limit = 10, includeDeleted = "false" } = req.query;
            const result = await this._getUseCase.execute(companyId, query, Number(page), Number(limit), includeDeleted === "true");
            (0, response_util_1.sendSuccess)(res, result, "Interviewers retrieved successfully");
        });
        this.toggleStatus = (0, asyncHandler_util_1.asyncHandler)(async (req, res) => {
            const companyId = req.user?.companyId;
            if (!companyId) {
                throw new AppError_1.AppError("Company ID not found in session", HttpStatus_enum_1.HttpStatus.UNAUTHORIZED, ErrorCodes_enum_1.ErrorCode.UNAUTHORIZED);
            }
            const { interviewerId } = req.params;
            await this._toggleUseCase.execute(interviewerId, companyId);
            (0, response_util_1.sendSuccess)(res, null, "Interviewer status updated successfully");
        });
        this.resendInvite = (0, asyncHandler_util_1.asyncHandler)(async (req, res) => {
            const { interviewerId } = req.params;
            await this._resendUseCase.execute(interviewerId);
            (0, response_util_1.sendSuccess)(res, null, "Invitation link resent successfully");
        });
        this.updateInterviewer = (0, asyncHandler_util_1.asyncHandler)(async (req, res) => {
            const companyId = req.user?.companyId;
            if (!companyId) {
                throw new AppError_1.AppError("Company ID not found in session", HttpStatus_enum_1.HttpStatus.UNAUTHORIZED, ErrorCodes_enum_1.ErrorCode.UNAUTHORIZED);
            }
            const { interviewerId } = req.params;
            const { firstName, lastName, designation, specialization } = req.body;
            await this._updateUseCase.execute(companyId, interviewerId, {
                firstName,
                lastName,
                designation,
                specialization,
            });
            (0, response_util_1.sendSuccess)(res, null, "Interviewer updated successfully");
        });
        this.deleteInterviewer = (0, asyncHandler_util_1.asyncHandler)(async (req, res) => {
            const companyId = req.user?.companyId;
            if (!companyId) {
                throw new AppError_1.AppError("Company ID not found in session", HttpStatus_enum_1.HttpStatus.UNAUTHORIZED, ErrorCodes_enum_1.ErrorCode.UNAUTHORIZED);
            }
            const { interviewerId } = req.params;
            await this._deleteUseCase.execute(companyId, interviewerId);
            (0, response_util_1.sendSuccess)(res, null, "Interviewer removed successfully");
        });
        this.restoreInterviewer = (0, asyncHandler_util_1.asyncHandler)(async (req, res) => {
            const companyId = req.user?.companyId;
            if (!companyId) {
                throw new AppError_1.AppError("Company ID not found in session", HttpStatus_enum_1.HttpStatus.UNAUTHORIZED, ErrorCodes_enum_1.ErrorCode.UNAUTHORIZED);
            }
            const { interviewerId } = req.params;
            await this._restoreUseCase.execute(companyId, interviewerId);
            (0, response_util_1.sendSuccess)(res, null, "Interviewer restored successfully");
        });
    }
}
exports.InterviewerManagementController = InterviewerManagementController;
