"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollegeJobApprovalController = void 0;
const asyncHandler_util_1 = require("@shared/utils/asyncHandler.util");
const response_util_1 = require("@shared/utils/response.util");
const HttpStatus_enum_1 = require("@domain/enums/HttpStatus.enum");
const AppError_1 = require("@application/errors/AppError");
const ErrorCodes_enum_1 = require("@domain/enums/ErrorCodes.enum");
const JobStatus_enum_1 = require("@domain/enums/JobStatus.enum");
class CollegeJobApprovalController {
    constructor(_getPendingJobsUseCase, _approveJobUseCase, _rejectUseCase) {
        this._getPendingJobsUseCase = _getPendingJobsUseCase;
        this._approveJobUseCase = _approveJobUseCase;
        this._rejectUseCase = _rejectUseCase;
        this.getPendingJobs = (0, asyncHandler_util_1.asyncHandler)(async (req, res) => {
            const orgId = req.user?.orgId;
            if (!orgId) {
                throw new AppError_1.AppError("Organization ID not found in session", HttpStatus_enum_1.HttpStatus.UNAUTHORIZED, ErrorCodes_enum_1.ErrorCode.UNAUTHORIZED);
            }
            const status = req.query.status || JobStatus_enum_1.JobStatus.PENDING_REVIEW;
            const result = await this._getPendingJobsUseCase.execute(orgId, status);
            (0, response_util_1.sendSuccess)(res, result.map((job) => job.toJSON()), "Jobs retrieved successfully");
        });
        this.approveJob = (0, asyncHandler_util_1.asyncHandler)(async (req, res) => {
            const orgId = req.user?.orgId;
            if (!orgId) {
                throw new AppError_1.AppError("Organization ID not found in session", HttpStatus_enum_1.HttpStatus.UNAUTHORIZED, ErrorCodes_enum_1.ErrorCode.UNAUTHORIZED);
            }
            const { jobId } = req.params;
            const result = await this._approveJobUseCase.execute(orgId, jobId);
            (0, response_util_1.sendSuccess)(res, result.toJSON(), "Job approved successfully");
        });
        this.rejectJob = (0, asyncHandler_util_1.asyncHandler)(async (req, res) => {
            const orgId = req.user?.orgId;
            if (!orgId) {
                throw new AppError_1.AppError("Organization ID not found in session", HttpStatus_enum_1.HttpStatus.UNAUTHORIZED, ErrorCodes_enum_1.ErrorCode.UNAUTHORIZED);
            }
            const { jobId } = req.params;
            const { reason } = req.body;
            const result = await this._rejectUseCase.execute(orgId, jobId, reason);
            (0, response_util_1.sendSuccess)(res, result.toJSON(), "Job rejected successfully");
        });
    }
}
exports.CollegeJobApprovalController = CollegeJobApprovalController;
