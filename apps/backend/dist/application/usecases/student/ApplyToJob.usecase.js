"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplyToJobUseCase = void 0;
const AppError_1 = require("@application/errors/AppError");
const HttpStatus_enum_1 = require("@domain/enums/HttpStatus.enum");
const ErrorCodes_enum_1 = require("@domain/enums/ErrorCodes.enum");
const student_1 = require("@domain/entities/student");
class ApplyToJobUseCase {
    constructor(_studentRepository, _jobRepository) {
        this._studentRepository = _studentRepository;
        this._jobRepository = _jobRepository;
    }
    async execute(studentId, jobId) {
        const student = await this._studentRepository.findById(studentId);
        if (!student) {
            throw new AppError_1.AppError("Student not found", HttpStatus_enum_1.HttpStatus.NOT_FOUND, ErrorCodes_enum_1.ErrorCode.NOT_FOUND);
        }
        const job = await this._jobRepository.findById(jobId);
        if (!job) {
            throw new AppError_1.AppError("Job not found", HttpStatus_enum_1.HttpStatus.NOT_FOUND, ErrorCodes_enum_1.ErrorCode.NOT_FOUND);
        }
        const appliedJobsList = student.appliedJobs;
        if (appliedJobsList.includes(jobId)) {
            throw new AppError_1.AppError("Already applied to this job", HttpStatus_enum_1.HttpStatus.BAD_REQUEST, ErrorCodes_enum_1.ErrorCode.VALIDATION_ERROR);
        }
        const updatedApplied = [...appliedJobsList, jobId];
        const updatedStudent = student_1.Student.create({
            ...student.toJSON(),
            appliedJobs: updatedApplied
        });
        await this._studentRepository.update(studentId, updatedStudent);
    }
}
exports.ApplyToJobUseCase = ApplyToJobUseCase;
