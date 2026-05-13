"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentManagementController = void 0;
const asyncHandler_util_1 = require("@shared/utils/asyncHandler.util");
const response_util_1 = require("@shared/utils/response.util");
const AppError_1 = require("@application/errors/AppError");
const HttpStatus_enum_1 = require("@domain/enums/HttpStatus.enum");
const ErrorCodes_enum_1 = require("@domain/enums/ErrorCodes.enum");
class StudentManagementController {
    constructor(getPendingUseCase, approveUseCase, rejectUseCase, bulkInviteUseCase, approveAccessRequestUseCase) {
        this.getPendingUseCase = getPendingUseCase;
        this.approveUseCase = approveUseCase;
        this.rejectUseCase = rejectUseCase;
        this.bulkInviteUseCase = bulkInviteUseCase;
        this.approveAccessRequestUseCase = approveAccessRequestUseCase;
        this.getPendingStudents = (0, asyncHandler_util_1.asyncHandler)(async (req, res) => {
            const orgId = req.user?.orgId;
            const status = req.query.status;
            if (!orgId) {
                throw new AppError_1.AppError("Organization ID not found in session", HttpStatus_enum_1.HttpStatus.UNAUTHORIZED, ErrorCodes_enum_1.ErrorCode.UNAUTHORIZED);
            }
            const students = await this.getPendingUseCase.execute(orgId, status);
            (0, response_util_1.sendSuccess)(res, students, "Pending students retrieved successfully");
        });
        this.approveStudent = (0, asyncHandler_util_1.asyncHandler)(async (req, res) => {
            const { studentId } = req.params;
            await this.approveUseCase.execute(studentId);
            (0, response_util_1.sendSuccess)(res, null, "Student approved successfully");
        });
        this.rejectStudent = (0, asyncHandler_util_1.asyncHandler)(async (req, res) => {
            const { studentId } = req.params;
            await this.rejectUseCase.execute(studentId);
            (0, response_util_1.sendSuccess)(res, null, "Student rejected successfully");
        });
        this.bulkInvite = (0, asyncHandler_util_1.asyncHandler)(async (req, res) => {
            const orgId = req.user?.orgId;
            const result = await this.bulkInviteUseCase.execute(orgId, req.body);
            (0, response_util_1.sendSuccess)(res, result, "Bulk invitation processed");
        });
        this.approveAccessRequest = (0, asyncHandler_util_1.asyncHandler)(async (req, res) => {
            const { studentId } = req.params;
            await this.approveAccessRequestUseCase.execute(studentId);
            (0, response_util_1.sendSuccess)(res, null, "Access request approved and invitation sent");
        });
    }
}
exports.StudentManagementController = StudentManagementController;
