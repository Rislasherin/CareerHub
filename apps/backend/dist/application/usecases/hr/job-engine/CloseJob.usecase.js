"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloseJobUseCase = void 0;
const JobStatus_enum_1 = require("@domain/enums/JobStatus.enum");
const AppError_1 = require("@application/errors/AppError");
const HttpStatus_enum_1 = require("@domain/enums/HttpStatus.enum");
const ErrorCodes_enum_1 = require("@domain/enums/ErrorCodes.enum");
class CloseJobUseCase {
    constructor(_jobRepository) {
        this._jobRepository = _jobRepository;
    }
    async execute(companyId, jobId) {
        const job = await this._jobRepository.findById(jobId);
        if (!job) {
            throw new AppError_1.AppError("Job not found", HttpStatus_enum_1.HttpStatus.NOT_FOUND, ErrorCodes_enum_1.ErrorCode.NOT_FOUND);
        }
        if (job.companyId !== companyId) {
            throw new AppError_1.AppError("Unauthorized access to this job", HttpStatus_enum_1.HttpStatus.FORBIDDEN, ErrorCodes_enum_1.ErrorCode.UNAUTHORIZED);
        }
        if (job.isDeleted) {
            throw new AppError_1.AppError("Cannot close a deleted job", HttpStatus_enum_1.HttpStatus.BAD_REQUEST, ErrorCodes_enum_1.ErrorCode.VALIDATION_ERROR);
        }
        job.status = JobStatus_enum_1.JobStatus.CLOSED;
        return await this._jobRepository.update(jobId, job);
    }
}
exports.CloseJobUseCase = CloseJobUseCase;
