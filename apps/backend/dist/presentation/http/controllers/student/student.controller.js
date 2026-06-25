"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentController = void 0;
const asyncHandler_util_1 = require("@shared/utils/asyncHandler.util");
const response_util_1 = require("@shared/utils/response.util");
const AppError_1 = require("@application/errors/AppError");
const HttpStatus_enum_1 = require("@domain/enums/HttpStatus.enum");
const ErrorCodes_enum_1 = require("@domain/enums/ErrorCodes.enum");
const infra_container_1 = require("@infrastructure/di/infra.container");
class StudentController {
    constructor(_uploadVerificationUseCase, _updateProfileUseCase, _studentRepository, _getStudentJobsUseCase, _applyToJobUseCase) {
        this._uploadVerificationUseCase = _uploadVerificationUseCase;
        this._updateProfileUseCase = _updateProfileUseCase;
        this._studentRepository = _studentRepository;
        this._getStudentJobsUseCase = _getStudentJobsUseCase;
        this._applyToJobUseCase = _applyToJobUseCase;
        this.uploadVerification = (0, asyncHandler_util_1.asyncHandler)(async (req, res) => {
            const studentId = req.user?.id;
            if (!studentId) {
                throw new AppError_1.AppError("Student ID not found in session", HttpStatus_enum_1.HttpStatus.UNAUTHORIZED, ErrorCodes_enum_1.ErrorCode.UNAUTHORIZED);
            }
            const file = req.file;
            if (!file) {
                throw new AppError_1.AppError("Verification document is required", HttpStatus_enum_1.HttpStatus.BAD_REQUEST, ErrorCodes_enum_1.ErrorCode.INTERNAL_ERROR);
            }
            const student = await this._uploadVerificationUseCase.execute(studentId, file);
            (0, response_util_1.sendSuccess)(res, student.toJSON(), "Verification details uploaded successfully. Please wait for admin review.");
        });
        this.getMe = (0, asyncHandler_util_1.asyncHandler)(async (req, res) => {
            (0, response_util_1.sendSuccess)(res, req.user, "Student profile retrieved");
        });
        this.getProfile = (0, asyncHandler_util_1.asyncHandler)(async (req, res) => {
            const studentId = req.user?.id;
            if (!studentId) {
                throw new AppError_1.AppError("Student ID not found in session", HttpStatus_enum_1.HttpStatus.UNAUTHORIZED, ErrorCodes_enum_1.ErrorCode.UNAUTHORIZED);
            }
            const student = await this._studentRepository.findById(studentId);
            if (!student) {
                throw new AppError_1.AppError("Student not found", HttpStatus_enum_1.HttpStatus.NOT_FOUND, ErrorCodes_enum_1.ErrorCode.NOT_FOUND);
            }
            const studentData = student.toJSON();
            try {
                if (student.collegeId) {
                    const org = await infra_container_1.organizationRepository.findById(student.collegeId);
                    if (org) {
                        studentData.collegeName = org.name;
                    }
                }
            }
            catch (err) { }
            (0, response_util_1.sendSuccess)(res, studentData, "Student profile fetched successfully");
        });
        this.updateProfile = (0, asyncHandler_util_1.asyncHandler)(async (req, res) => {
            const studentId = req.user?.id;
            if (!studentId) {
                throw new AppError_1.AppError("Student ID not found in session", HttpStatus_enum_1.HttpStatus.UNAUTHORIZED, ErrorCodes_enum_1.ErrorCode.UNAUTHORIZED);
            }
            const student = await this._updateProfileUseCase.execute(studentId, req.body);
            const studentData = student.toJSON();
            try {
                if (student.collegeId) {
                    const org = await infra_container_1.organizationRepository.findById(student.collegeId);
                    if (org) {
                        studentData.collegeName = org.name;
                    }
                }
            }
            catch (err) { }
            (0, response_util_1.sendSuccess)(res, studentData, "Student profile updated successfully");
        });
        this.getJobs = (0, asyncHandler_util_1.asyncHandler)(async (req, res) => {
            const studentId = req.user?.id;
            if (!studentId) {
                throw new AppError_1.AppError("Student ID not found in session", HttpStatus_enum_1.HttpStatus.UNAUTHORIZED, ErrorCodes_enum_1.ErrorCode.UNAUTHORIZED);
            }
            const jobs = await this._getStudentJobsUseCase.execute(studentId);
            (0, response_util_1.sendSuccess)(res, jobs, "Student jobs feed retrieved successfully");
        });
        this.applyJob = (0, asyncHandler_util_1.asyncHandler)(async (req, res) => {
            const studentId = req.user?.id;
            if (!studentId) {
                throw new AppError_1.AppError("Student ID not found in session", HttpStatus_enum_1.HttpStatus.UNAUTHORIZED, ErrorCodes_enum_1.ErrorCode.UNAUTHORIZED);
            }
            const jobId = req.params.id;
            if (!jobId) {
                throw new AppError_1.AppError("Job ID is required", HttpStatus_enum_1.HttpStatus.BAD_REQUEST, ErrorCodes_enum_1.ErrorCode.VALIDATION_ERROR);
            }
            await this._applyToJobUseCase.execute(studentId, jobId);
            (0, response_util_1.sendSuccess)(res, null, "Applied to job successfully");
        });
    }
}
exports.StudentController = StudentController;
