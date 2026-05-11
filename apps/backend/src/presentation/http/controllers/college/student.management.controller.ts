import { Request, Response } from "express";
import { asyncHandler } from "@shared/utils/asyncHandler.util";
import { sendSuccess } from "@shared/utils/response.util";
import { IGetPendingStudentsUseCase } from "@application/usecases/college/student-management/GetPendingStudents.usecase";
import { IApproveStudentUseCase } from "@application/usecases/college/student-management/ApproveStudent.usecase";
import { IRejectStudentUseCase } from "@application/usecases/college/student-management/RejectStudent.usecase";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";

export class StudentManagementController {
  constructor(
    private readonly getPendingUseCase: IGetPendingStudentsUseCase,
    private readonly approveUseCase: IApproveStudentUseCase,
    private readonly rejectUseCase: IRejectStudentUseCase
  ) {}

  getPendingStudents = asyncHandler(async (req: any, res: Response) => {
    const orgId = req.user?.orgId; 
    if (!orgId) {
      throw new AppError("Organization ID not found in session", HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
    }
    const students = await this.getPendingUseCase.execute(orgId);
    sendSuccess(res, students, "Pending students retrieved successfully");
  });

  approveStudent = asyncHandler(async (req: Request, res: Response) => {
    const { studentId } = req.params;
    await this.approveUseCase.execute(studentId);
    sendSuccess(res, null, "Student approved successfully");
  });

  rejectStudent = asyncHandler(async (req: Request, res: Response) => {
    const { studentId } = req.params;
    await this.rejectUseCase.execute(studentId);
    sendSuccess(res, null, "Student rejected successfully");
  });
}
