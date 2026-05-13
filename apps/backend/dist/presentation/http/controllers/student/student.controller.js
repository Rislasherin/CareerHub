"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentController = void 0;
const asyncHandler_util_1 = require("@shared/utils/asyncHandler.util");
const response_util_1 = require("@shared/utils/response.util");
const AppError_1 = require("@application/errors/AppError");
const HttpStatus_enum_1 = require("@domain/enums/HttpStatus.enum");
const ErrorCodes_enum_1 = require("@domain/enums/ErrorCodes.enum");
class StudentController {
    constructor(uploadVerificationUseCase) {
        this.uploadVerificationUseCase = uploadVerificationUseCase;
        this.uploadVerification = (0, asyncHandler_util_1.asyncHandler)(async (req, res) => {
            const studentId = req.user?.id;
            if (!studentId) {
                throw new AppError_1.AppError("Student ID not found in session", HttpStatus_enum_1.HttpStatus.UNAUTHORIZED, ErrorCodes_enum_1.ErrorCode.UNAUTHORIZED);
            }
            // Assuming proofUrl comes from previous middleware (e.g. file upload to S3/Cloudinary)
            // For now we'll take it from body
            const { proofUrl } = req.body;
            if (!proofUrl) {
                throw new AppError_1.AppError("Proof URL is required", HttpStatus_enum_1.HttpStatus.BAD_REQUEST, ErrorCodes_enum_1.ErrorCode.INTERNAL_ERROR);
            }
            await this.uploadVerificationUseCase.execute(studentId, proofUrl);
            (0, response_util_1.sendSuccess)(res, null, "Verification details uploaded successfully. Please wait for admin review.");
        });
        this.getMe = (0, asyncHandler_util_1.asyncHandler)(async (req, res) => {
            // Return current student info (handled by auth middleware)
            (0, response_util_1.sendSuccess)(res, req.user, "Student profile retrieved");
        });
    }
}
exports.StudentController = StudentController;
