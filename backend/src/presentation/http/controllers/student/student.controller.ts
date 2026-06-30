import { Request, Response } from "express";
import { asyncHandler } from "@shared/utils/asyncHandler.util";
import { sendSuccess } from "@shared/utils/response.util";
import { IUploadStudentVerificationUseCase } from "@application/usecases/auth/student/interfaces/IUploadStudentVerification.usecase";
import { IUpdateStudentProfileUseCase } from "@application/usecases/student/interfaces/IUpdateStudentProfile.usecase";
import { IStudentRepository } from "@domain/repositories/IStudentRepository";
import { IGetStudentJobsUseCase } from "@application/usecases/student/interfaces/IGetStudentJobs.usecase";
import { IApplyToJobUseCase } from "@application/usecases/student/interfaces/IApplyToJob.usecase";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { organizationRepository } from "@infrastructure/di/infra.container";
import { MESSAGES } from "@shared/constants/messages.constants";
import { IGetCollegeNoticesUseCase } from "@application/usecases/college/notices/interfaces/IGetCollegeNotices.usecase";

export class StudentController {
  constructor(
    private readonly _uploadVerificationUseCase: IUploadStudentVerificationUseCase,
    private readonly _updateProfileUseCase: IUpdateStudentProfileUseCase,
    private readonly _studentRepository: IStudentRepository,
    private readonly _getStudentJobsUseCase: IGetStudentJobsUseCase,
    private readonly _applyToJobUseCase: IApplyToJobUseCase,
    private readonly _getCollegeNoticeUseCase:IGetCollegeNoticesUseCase
  ) { }

  uploadVerification = asyncHandler(async (req: Request, res: Response) => {
    const studentId = req.user?.id;
    if (!studentId) {
      throw new AppError(MESSAGES.ERROR.UNAUTHORIZED, HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
    }

    const file = req.file;
    // Support both multipart file upload and base64 data in body
    if (!file && !req.body.verificationDocument) {
      throw new AppError(
        "Verification document is required",
        HttpStatus.BAD_REQUEST,
        ErrorCode.VALIDATION_ERROR,
      );
    }

    // If file is provided, upload via storage service; otherwise use the provided URL/base64
    const uploadedStudent = await this._uploadVerificationUseCase.execute(
      studentId,
      file || req.body.verificationDocument,
    );
    sendSuccess(res, uploadedStudent.toJSON(), "Verification details uploaded successfully. Please wait for admin review.");
  });

  getMe = asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, req.user, MESSAGES.SUCCESS.PROFILE_RETRIEVED);
  });

  getProfile = asyncHandler(async (req: Request, res: Response) => {
    const studentId = req.user?.id;
    if (!studentId) {
      throw new AppError(MESSAGES.ERROR.UNAUTHORIZED, HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
    }
    const student = await this._studentRepository.findById(studentId);
    if (!student) {
      throw new AppError(MESSAGES.ERROR.NOT_FOUND, HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }

    const studentData = student.toJSON() as unknown as Record<string, unknown>;
    try {
      if (student.collegeId) {
        const org = await organizationRepository.findById(student.collegeId);
        if (org) {
          studentData.collegeName = org.name;
        }
      }
    } catch (err) { }

    sendSuccess(res, studentData, MESSAGES.SUCCESS.FETCHED);
  });

  updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const studentId = req.user?.id;
    if (!studentId) {
      throw new AppError(MESSAGES.ERROR.UNAUTHORIZED, HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
    }
    const student = await this._updateProfileUseCase.execute(studentId, req.body);

    const studentData = student.toJSON() as unknown as Record<string, unknown>;
    try {
      if (student.collegeId) {
        const org = await organizationRepository.findById(student.collegeId);
        if (org) {
          studentData.collegeName = org.name;
        }
      }
    } catch (err) { }

    sendSuccess(res, studentData, MESSAGES.SUCCESS.UPDATED);
  });

  getJobs = asyncHandler(async (req: Request, res: Response) => {
    const studentId = req.user?.id;
    if (!studentId) {
      throw new AppError(MESSAGES.ERROR.UNAUTHORIZED, HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
    }
    const jobs = await this._getStudentJobsUseCase.execute(studentId);
    sendSuccess(res, jobs, MESSAGES.SUCCESS.FETCHED);
  });

  applyJob = asyncHandler(async (req: Request, res: Response) => {
    const studentId = req.user?.id;
    if (!studentId) {
      throw new AppError(MESSAGES.ERROR.UNAUTHORIZED, HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
    }
    const jobId = req.params.id;
    if (!jobId) {
      throw new AppError("Job ID is required", HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
    }
    await this._applyToJobUseCase.execute(studentId, jobId);
    sendSuccess(res, null, "Applied to job successfully");
  });

  getNotices = asyncHandler(async(req:Request,res:Response)=>{
    const studentId = req.user?.id

    if(!studentId){
      throw new AppError(MESSAGES.ERROR.UNAUTHORIZED,HttpStatus.UNAUTHORIZED,ErrorCode.UNAUTHORIZED);
    }
      const student = await this._studentRepository.findById(studentId);
      if(!student || !student?.collegeId){
        throw new AppError("College not found for this student", HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND)
      }
      const notices = await this._getCollegeNoticeUseCase.execute(student.collegeId.toString());
      sendSuccess(res,notices,"Notices Retrieved Successfully")
  })

}
