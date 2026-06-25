"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HRJobController = void 0;
const asyncHandler_util_1 = require("@shared/utils/asyncHandler.util");
const response_util_1 = require("@shared/utils/response.util");
const HttpStatus_enum_1 = require("@domain/enums/HttpStatus.enum");
const AppError_1 = require("@application/errors/AppError");
const ErrorCodes_enum_1 = require("@domain/enums/ErrorCodes.enum");
class HRJobController {
    constructor(_postJobUseCase, _getHRJobsUseCase, _closeJobUseCase, _deleteJobUseCase, _getHRCandidatesUseCase) {
        this._postJobUseCase = _postJobUseCase;
        this._getHRJobsUseCase = _getHRJobsUseCase;
        this._closeJobUseCase = _closeJobUseCase;
        this._deleteJobUseCase = _deleteJobUseCase;
        this._getHRCandidatesUseCase = _getHRCandidatesUseCase;
        this.postJob = (0, asyncHandler_util_1.asyncHandler)(async (req, res) => {
            const companyId = req.user?.companyId;
            if (!companyId) {
                throw new AppError_1.AppError("Company ID not found in session", HttpStatus_enum_1.HttpStatus.UNAUTHORIZED, ErrorCodes_enum_1.ErrorCode.UNAUTHORIZED);
            }
            const result = await this._postJobUseCase.execute(companyId, req.body);
            (0, response_util_1.sendSuccess)(res, result.toJSON(), "Job post created and submitted for approval successfully", HttpStatus_enum_1.HttpStatus.CREATED);
        });
        this.getJobs = (0, asyncHandler_util_1.asyncHandler)(async (req, res) => {
            const companyId = req.user?.companyId;
            if (!companyId) {
                throw new AppError_1.AppError("Company ID not found in session", HttpStatus_enum_1.HttpStatus.UNAUTHORIZED, ErrorCodes_enum_1.ErrorCode.UNAUTHORIZED);
            }
            const { status, query = "", page = 1, limit = 10 } = req.query;
            const result = await this._getHRJobsUseCase.execute(companyId, {
                status: status,
                searchQuery: query
            }, Number(page), Number(limit));
            (0, response_util_1.sendSuccess)(res, {
                jobs: result.jobs.map((job) => job.toJSON()),
                total: result.total
            }, "HR Jobs retrieved successfully");
        });
        this.closeJob = (0, asyncHandler_util_1.asyncHandler)(async (req, res) => {
            const companyId = req.user?.companyId;
            if (!companyId) {
                throw new AppError_1.AppError("Company ID not found in session", HttpStatus_enum_1.HttpStatus.UNAUTHORIZED, ErrorCodes_enum_1.ErrorCode.UNAUTHORIZED);
            }
            const { jobId } = req.params;
            const result = await this._closeJobUseCase.execute(companyId, jobId);
            (0, response_util_1.sendSuccess)(res, result.toJSON(), "Job closed successfully");
        });
        this.deleteJob = (0, asyncHandler_util_1.asyncHandler)(async (req, res) => {
            const companyId = req.user?.companyId;
            if (!companyId) {
                throw new AppError_1.AppError("Company ID not found in session", HttpStatus_enum_1.HttpStatus.UNAUTHORIZED, ErrorCodes_enum_1.ErrorCode.UNAUTHORIZED);
            }
            const { jobId } = req.params;
            const result = await this._deleteJobUseCase.execute(companyId, jobId);
            (0, response_util_1.sendSuccess)(res, result.toJSON(), "Job post deleted successfully");
        });
        this.getCandidates = (0, asyncHandler_util_1.asyncHandler)(async (req, res) => {
            const companyId = req.user?.companyId;
            if (!companyId) {
                throw new AppError_1.AppError("Company ID not found in session", HttpStatus_enum_1.HttpStatus.UNAUTHORIZED, ErrorCodes_enum_1.ErrorCode.UNAUTHORIZED);
            }
            const candidates = await this._getHRCandidatesUseCase.execute(companyId);
            (0, response_util_1.sendSuccess)(res, candidates, "Candidates list retrieved successfully");
        });
    }
}
exports.HRJobController = HRJobController;
