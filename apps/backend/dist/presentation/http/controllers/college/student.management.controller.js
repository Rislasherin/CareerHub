"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentManagementController = void 0;
const asyncHandler_util_1 = require("@shared/utils/asyncHandler.util");
const response_util_1 = require("@shared/utils/response.util");
const AppError_1 = require("@application/errors/AppError");
const HttpStatus_enum_1 = require("@domain/enums/HttpStatus.enum");
const ErrorCodes_enum_1 = require("@domain/enums/ErrorCodes.enum");
class StudentManagementController {
    constructor(_getPendingUseCase, _approveUseCase, _rejectUseCase, _bulkInviteUseCase, _approveAccessRequestUseCase, _getDashboardStatsUseCase, _getAllStudentsUseCase, _toggleStatusUseCase) {
        this._getPendingUseCase = _getPendingUseCase;
        this._approveUseCase = _approveUseCase;
        this._rejectUseCase = _rejectUseCase;
        this._bulkInviteUseCase = _bulkInviteUseCase;
        this._approveAccessRequestUseCase = _approveAccessRequestUseCase;
        this._getDashboardStatsUseCase = _getDashboardStatsUseCase;
        this._getAllStudentsUseCase = _getAllStudentsUseCase;
        this._toggleStatusUseCase = _toggleStatusUseCase;
        this.getPendingStudents = (0, asyncHandler_util_1.asyncHandler)(async (req, res) => {
            const orgId = req.user?.orgId;
            const status = req.query.status;
            if (!orgId) {
                throw new AppError_1.AppError("Organization ID not found in session", HttpStatus_enum_1.HttpStatus.UNAUTHORIZED, ErrorCodes_enum_1.ErrorCode.UNAUTHORIZED);
            }
            const students = await this._getPendingUseCase.execute(orgId, status);
            (0, response_util_1.sendSuccess)(res, students, "Pending students retrieved successfully");
        });
        this.approveStudent = (0, asyncHandler_util_1.asyncHandler)(async (req, res) => {
            const { studentId } = req.params;
            await this._approveUseCase.execute(studentId);
            (0, response_util_1.sendSuccess)(res, null, "Student approved successfully");
        });
        this.rejectStudent = (0, asyncHandler_util_1.asyncHandler)(async (req, res) => {
            const { studentId } = req.params;
            const { reason } = req.body;
            await this._rejectUseCase.execute(studentId, reason);
            (0, response_util_1.sendSuccess)(res, null, "Student rejected successfully");
        });
        this.bulkInvite = (0, asyncHandler_util_1.asyncHandler)(async (req, res) => {
            const orgId = req.user?.orgId;
            const result = await this._bulkInviteUseCase.execute(orgId, req.body);
            (0, response_util_1.sendSuccess)(res, result, "Bulk invitation processed");
        });
        this.approveAccessRequest = (0, asyncHandler_util_1.asyncHandler)(async (req, res) => {
            const { studentId } = req.params;
            await this._approveAccessRequestUseCase.execute(studentId);
            (0, response_util_1.sendSuccess)(res, null, "Access request approved and invitation sent");
        });
        this.getDashboardStats = (0, asyncHandler_util_1.asyncHandler)(async (req, res) => {
            const orgId = req.user?.orgId;
            if (!orgId) {
                throw new AppError_1.AppError("Organization ID not found in session", HttpStatus_enum_1.HttpStatus.UNAUTHORIZED, ErrorCodes_enum_1.ErrorCode.UNAUTHORIZED);
            }
            const stats = await this._getDashboardStatsUseCase.execute(orgId);
            (0, response_util_1.sendSuccess)(res, stats, "Dashboard stats retrieved successfully");
        });
        this.getAllStudents = (0, asyncHandler_util_1.asyncHandler)(async (req, res) => {
            const orgId = req.user?.orgId;
            const { query, page, limit } = req.query;
            if (!orgId) {
                throw new AppError_1.AppError("Organization ID not found in session", HttpStatus_enum_1.HttpStatus.UNAUTHORIZED, ErrorCodes_enum_1.ErrorCode.UNAUTHORIZED);
            }
            const result = await this._getAllStudentsUseCase.execute(orgId, query, Number(page) || 1, Number(limit) || 10);
            (0, response_util_1.sendSuccess)(res, result, "Students retrieved successfully");
        });
        this.toggleStatus = (0, asyncHandler_util_1.asyncHandler)(async (req, res) => {
            const { studentId } = req.params;
            const { status } = req.body;
            const adminRole = req.user?.role;
            console.log(`Toggling status for student ${studentId} to ${status} by ${adminRole}`);
            await this._toggleStatusUseCase.execute(studentId, status, adminRole);
            (0, response_util_1.sendSuccess)(res, null, `Student status updated to ${status}`);
        });
    }
}
exports.StudentManagementController = StudentManagementController;
