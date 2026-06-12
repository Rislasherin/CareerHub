import { Request, Response } from "express";
import { asyncHandler } from "@shared/utils/asyncHandler.util";
import { sendSuccess } from "@shared/utils/response.util";
import { IUploadStudentVerificationUseCase } from "@application/usecases/auth/student/implementations/UploadStudentVerification.usecase";
import { IUpdateStudentProfileUseCase } from "@application/usecases/student/UpdateStudentProfile.usecase";
import { IStudentRepository } from "@domain/repositories/IStudentRepository";
import { IGetStudentJobsUseCase } from "@application/usecases/student/GetStudentJobs.usecase";
import { IApplyToJobUseCase } from "@application/usecases/student/ApplyToJob.usecase";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { organizationRepository } from "@infrastructure/di/infra.container";

export class StudentController {
  constructor(
    private readonly _uploadVerificationUseCase: IUploadStudentVerificationUseCase,
    private readonly _updateProfileUseCase: IUpdateStudentProfileUseCase,
    private readonly _studentRepository: IStudentRepository,
    private readonly _getStudentJobsUseCase: IGetStudentJobsUseCase,
    private readonly _applyToJobUseCase: IApplyToJobUseCase
  ) { }

  uploadVerification = asyncHandler(async (req: any, res: Response) => {
    const studentId = req.user?.id;
    if (!studentId) {
      throw new AppError("Student ID not found in session", HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
    }

    const file = req.file;
    if (!file) {
      throw new AppError("Verification document is required", HttpStatus.BAD_REQUEST, ErrorCode.INTERNAL_ERROR);
    }

    const student = await this._uploadVerificationUseCase.execute(studentId, file);
    sendSuccess(res, student.toJSON(), "Verification details uploaded successfully. Please wait for admin review.");
  });

  getMe = asyncHandler(async (req: any, res: Response) => {
    sendSuccess(res, req.user, "Student profile retrieved");
  });

  getProfile = asyncHandler(async (req: any, res: Response) => {
    const studentId = req.user?.id;
    if (!studentId) {
      throw new AppError("Student ID not found in session", HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
    }
    const student = await this._studentRepository.findById(studentId);
    if (!student) {
      throw new AppError("Student not found", HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }

    const studentData = student.toJSON() as any;
    try {
      if (student.collegeId) {
        const org = await organizationRepository.findById(student.collegeId);
        if (org) {
          studentData.collegeName = org.name;
        }
      }
    } catch (err) { }

    sendSuccess(res, studentData, "Student profile fetched successfully");
  });

  updateProfile = asyncHandler(async (req: any, res: Response) => {
    const studentId = req.user?.id;
    if (!studentId) {
      throw new AppError("Student ID not found in session", HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
    }
    const student = await this._updateProfileUseCase.execute(studentId, req.body);

    const studentData = student.toJSON() as any;
    try {
      if (student.collegeId) {
        const org = await organizationRepository.findById(student.collegeId);
        if (org) {
          studentData.collegeName = org.name;
        }
      }
    } catch (err) { }

    sendSuccess(res, studentData, "Student profile updated successfully");
  });

  getJobs = asyncHandler(async (req: any, res: Response) => {
    const studentId = req.user?.id;
    if (!studentId) {
      throw new AppError("Student ID not found in session", HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
    }
    const jobs = await this._getStudentJobsUseCase.execute(studentId);
    sendSuccess(res, jobs, "Student jobs feed retrieved successfully");
  });

  applyJob = asyncHandler(async (req: any, res: Response) => {
    const studentId = req.user?.id;
    if (!studentId) {
      throw new AppError("Student ID not found in session", HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
    }
    const jobId = req.params.id;
    if (!jobId) {
      throw new AppError("Job ID is required", HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
    }
    await this._applyToJobUseCase.execute(studentId, jobId);
    sendSuccess(res, null, "Applied to job successfully");
  });
}
