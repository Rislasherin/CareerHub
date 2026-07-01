import { Request, Response } from "express";
import { asyncHandler } from "@shared/utils/asyncHandler.util";
import { sendSuccess } from "@shared/utils/response.util";
import { IGetPendingStudentsUseCase } from "@application/usecases/college/student-management/interfaces/IGetPendingStudents.usecase";;
import { IApproveStudentUseCase } from "@application/usecases/college/student-management/interfaces/IApproveStudent.usecase";;
import { IRejectStudentUseCase } from "@application/usecases/college/student-management/interfaces/IRejectStudent.usecase";;
import { IBulkInviteStudentsUseCase } from "@application/usecases/college/student-management/interfaces/IBulkInviteStudents.usecase";;
import { IApproveAccessRequestUseCase } from "@application/usecases/college/student-management/interfaces/IApproveAccessRequest.usecase";;
import { IGetAllStudentsUseCase } from "@application/usecases/college/student-management/interfaces/IGetAllStudents.usecase";;
import { IToggleStudentStatusUseCase } from "@application/usecases/college/student-management/interfaces/IToggleStudentStatus.usecase";;
import { IGetCollegeDashboardStatsUseCase } from "@application/usecases/college/interfaces/IGetCollegeDashboardStats.usecase";;
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { UserStatus } from "@domain/enums/user.status.enum";
import { MESSAGES } from "@shared/constants/messages.constants";

export class StudentManagementController {
  constructor(
    private readonly _getPendingUseCase: IGetPendingStudentsUseCase,
    private readonly _approveUseCase: IApproveStudentUseCase,
    private readonly _rejectUseCase: IRejectStudentUseCase,
    private readonly _bulkInviteUseCase: IBulkInviteStudentsUseCase,
    private readonly _approveAccessRequestUseCase: IApproveAccessRequestUseCase,
    private readonly _getDashboardStatsUseCase: IGetCollegeDashboardStatsUseCase,
    private readonly _getAllStudentsUseCase: IGetAllStudentsUseCase,
    private readonly _toggleStatusUseCase: IToggleStudentStatusUseCase
  ) { }

  getPendingStudents = asyncHandler(async (req: Request, res: Response) => {
    const orgId = req.user?.orgId;
    const status = req.query.status as UserStatus | undefined;
    if (!orgId) {
      throw new AppError("Organization ID not found in session", HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
    }
    const students = await this._getPendingUseCase.execute(orgId, status);
    sendSuccess(res, students, MESSAGES.SUCCESS.FETCHED);
  });

  approveStudent = asyncHandler(async (req: Request, res: Response) => {
    const { studentId } = req.params;
    await this._approveUseCase.execute(studentId);
    sendSuccess(res, null, MESSAGES.SUCCESS.UPDATED);
  });

  rejectStudent = asyncHandler(async (req: Request, res: Response) => {
    const { studentId } = req.params;
    const { reason } = req.body;
    await this._rejectUseCase.execute(studentId, reason);
    sendSuccess(res, null, MESSAGES.SUCCESS.UPDATED);
  });

  bulkInvite = asyncHandler(async (req: Request, res: Response) => {
    const orgId = req.user?.orgId;
    if (!orgId) {
      throw new AppError("Organization ID not found in session", HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
    }
    const result = await this._bulkInviteUseCase.execute(orgId, req.body);
    sendSuccess(res, result, "Bulk invitation processed");
  });

  approveAccessRequest = asyncHandler(async (req: Request, res: Response) => {
    const { studentId } = req.params;
    await this._approveAccessRequestUseCase.execute(studentId);
    sendSuccess(res, null, "Access request approved and invitation sent");
  });

  getDashboardStats = asyncHandler(async (req: Request, res: Response) => {
    const orgId = req.user?.orgId;
    if (!orgId) {
      throw new AppError("Organization ID not found in session", HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
    }
    const stats = await this._getDashboardStatsUseCase.execute(orgId);
    sendSuccess(res, stats, MESSAGES.SUCCESS.FETCHED);
  });

  getAllStudents = asyncHandler(async (req: Request, res: Response) => {
    const orgId = req.user?.orgId;
    const { query, page, limit } = req.query;
    if (!orgId) {
      throw new AppError("Organization ID not found in session", HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
    }
    const result = await this._getAllStudentsUseCase.execute(orgId, query as string, Number(page) || 1, Number(limit) || 10);
    sendSuccess(res, result, MESSAGES.SUCCESS.FETCHED);
  });

  toggleStatus = asyncHandler(async (req: Request, res: Response) => {
    const { studentId } = req.params;
    const { status } = req.body;
    const adminRole = req.user?.role;
    console.log(`Toggling status for student ${studentId} to ${status} by ${adminRole}`);
    await this._toggleStatusUseCase.execute(studentId, status, adminRole);
    sendSuccess(res, null, `Student status updated to ${status}`);
  });
}
