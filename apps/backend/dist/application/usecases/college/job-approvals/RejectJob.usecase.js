"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RejectJobUseCase = void 0;
const JobStatus_enum_1 = require("@domain/enums/JobStatus.enum");
const AppError_1 = require("@application/errors/AppError");
const HttpStatus_enum_1 = require("@domain/enums/HttpStatus.enum");
const ErrorCodes_enum_1 = require("@domain/enums/ErrorCodes.enum");
class RejectJobUseCase {
    constructor(_jobRepository) {
        this._jobRepository = _jobRepository;
    }
    async execute(collegeId, jobId, rejectionNote) {
        if (!rejectionNote || rejectionNote.trim() === "") {
            throw new AppError_1.AppError("Rejection note is required", HttpStatus_enum_1.HttpStatus.BAD_REQUEST, ErrorCodes_enum_1.ErrorCode.VALIDATION_ERROR);
        }
        const job = await this._jobRepository.findById(jobId);
        if (!job) {
            throw new AppError_1.AppError("Job not found", HttpStatus_enum_1.HttpStatus.NOT_FOUND, ErrorCodes_enum_1.ErrorCode.NOT_FOUND);
        }
        if (job.collegeId !== collegeId && job.collegeId !== "ALL") {
            throw new AppError_1.AppError("Unauthorized access to this job", HttpStatus_enum_1.HttpStatus.FORBIDDEN, ErrorCodes_enum_1.ErrorCode.UNAUTHORIZED);
        }
        if (job.collegeId === "ALL") {
            if (job.rejectedColleges.includes(collegeId)) {
                throw new AppError_1.AppError("Job already rejected by your college", HttpStatus_enum_1.HttpStatus.BAD_REQUEST, ErrorCodes_enum_1.ErrorCode.VALIDATION_ERROR);
            }
            job.rejectForCollege(collegeId);
        }
        else {
            if (job.status !== JobStatus_enum_1.JobStatus.PENDING_REVIEW) {
                throw new AppError_1.AppError("Job is not pending review", HttpStatus_enum_1.HttpStatus.BAD_REQUEST, ErrorCodes_enum_1.ErrorCode.VALIDATION_ERROR);
            }
            job.status = JobStatus_enum_1.JobStatus.REJECTED;
            job.rejectionNote = rejectionNote;
            job.rejectForCollege(collegeId);
        }
        return await this._jobRepository.update(jobId, job);
    }
}
exports.RejectJobUseCase = RejectJobUseCase;
