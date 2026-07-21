import { Request, Response } from "express";
import { asyncHandler } from "@shared/utils/asyncHandler.util";
import { sendSuccess } from "@shared/utils/response.util";
import { IUploadStudentVerificationUseCase } from "@application/usecases/auth/student/interfaces/IUploadStudentVerification.usecase";
import { IUpdateStudentProfileUseCase } from "@application/usecases/student/interfaces/IUpdateStudentProfile.usecase";

import { IGetStudentJobsUseCase } from "@application/usecases/student/interfaces/IGetStudentJobs.usecase";
import { IApplyToJobUseCase } from "@application/usecases/student/interfaces/IApplyToJob.usecase";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { MESSAGES } from "@shared/constants/messages.constants";
import { IGetStudentFullProfileUseCase } from "@application/usecases/student/interfaces/IGetStudentFullProfile.usecase";
import { IGetStudentNoticesUseCase } from "@application/usecases/student/interfaces/IGetStudentNotices.usecase";
import { IUploadResumeUseCase } from "@application/usecases/student/Resume/interfaces/IUploadResume.usecase";
import { IDeleteResumeUseCase } from "@application/usecases/student/Resume/interfaces/IDeleteResume.usecase";
import { IGetStudentApplicationsUseCase } from "@application/usecases/student/interfaces/IGetStudentApplications.usecase";
import { IGetStudentInterviewsUseCase } from "@application/usecases/student/interfaces/IGetStudentInterviews.usecase";
import { IGenerateOfferPdfUseCase } from "@application/usecases/hr/offer-engine/interfaces/IGenerateOfferPdf.usecase";
import { IGenerateProfessionalSummaryUseCase } from "@application/usecases/student/AI/interfaces/IGenerateProfessionalSummary.usecase";

export class StudentController {
  constructor(
    private readonly _uploadVerificationUseCase: IUploadStudentVerificationUseCase,
    private readonly _updateProfileUseCase: IUpdateStudentProfileUseCase,

    private readonly _getStudentJobsUseCase: IGetStudentJobsUseCase,
    private readonly _applyToJobUseCase: IApplyToJobUseCase,
    private readonly _getStudentFullProfileUseCase: IGetStudentFullProfileUseCase,
    private readonly _getStudentNoticesUseCase: IGetStudentNoticesUseCase,

    private readonly _uploadResumeUseCase: IUploadResumeUseCase,
    private readonly _deleteResumeUsecase: IDeleteResumeUseCase,
    private readonly _getStudentApplicationsUseCase: IGetStudentApplicationsUseCase,
    private readonly _getStudentInterviewsUseCase: IGetStudentInterviewsUseCase,
    private readonly _getStudentOffersUseCase: any,
    private readonly _respondToOfferUseCase: any,
    private readonly _generateOfferPdfUseCase: IGenerateOfferPdfUseCase,
    private readonly _generateProfessionalSummaryUseCase: IGenerateProfessionalSummaryUseCase
  ) { }

  generateProfessionalSummary = asyncHandler(async (req: Request, res: Response) => {
    const studentId = req.user?.id;
    if (!studentId) {
      throw new AppError(MESSAGES.ERROR.UNAUTHORIZED, HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
    }
    const summary = await this._generateProfessionalSummaryUseCase.execute(studentId);
    sendSuccess(res, { summary }, "Professional summary generated successfully");
  });

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
    sendSuccess(res, uploadedStudent.toJSON(), MESSAGES.SUCCESS.CREATED);
  });

  getMe = asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, req.user, MESSAGES.SUCCESS.PROFILE_RETRIEVED);
  });

  getProfile = asyncHandler(async (req: Request, res: Response) => {
    const studentId = req.user?.id;
    if (!studentId) {
      throw new AppError(MESSAGES.ERROR.UNAUTHORIZED, HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
    }
    const studentData = await this._getStudentFullProfileUseCase.execute(studentId);
    sendSuccess(res, studentData, MESSAGES.SUCCESS.FETCHED);
  });

  updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const studentId = req.user?.id;
    if (!studentId) {
      throw new AppError(MESSAGES.ERROR.UNAUTHORIZED, HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
    }
    const student = await this._updateProfileUseCase.execute(studentId, req.body);

    const studentData = await this._getStudentFullProfileUseCase.execute(studentId);
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
    sendSuccess(res, null, MESSAGES.SUCCESS.UPDATED);
  });

  getApplications = asyncHandler(async (req: Request, res: Response) => {
    const studentId = req.user?.id;
    if (!studentId) {
      throw new AppError(MESSAGES.ERROR.UNAUTHORIZED, HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
    }
    const applications = await this._getStudentApplicationsUseCase.execute(studentId);
    sendSuccess(res, applications, MESSAGES.SUCCESS.FETCHED);
  });

  getNotices = asyncHandler(async (req: Request, res: Response) => {
    const studentId = req.user?.id

    if (!studentId) {
      throw new AppError(MESSAGES.ERROR.UNAUTHORIZED, HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
    }
    const notices = await this._getStudentNoticesUseCase.execute(studentId);
    sendSuccess(res, notices, MESSAGES.SUCCESS.FETCHED);
  })

  uploadResume = asyncHandler(async (req: Request, res: Response) => {
    const studentId = req.user?.id;
    if (!studentId) throw new AppError(MESSAGES.ERROR.UNAUTHORIZED, HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
    if (!req.file) throw new AppError("No file uploaded", HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);

    const resume = await this._uploadResumeUseCase.execute(studentId, req.file as Express.Multer.File);
    sendSuccess(res, resume, MESSAGES.SUCCESS.RESUME_UPLOADED)
  })

  deleteResume = asyncHandler(async (req: Request, res: Response) => {
    const studentId = req.user?.id;
    if (!studentId) throw new AppError(MESSAGES.ERROR.UNAUTHORIZED, HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
    await this._deleteResumeUsecase.execute(studentId)
    sendSuccess(res, null, MESSAGES.SUCCESS.RESUME_DELETED);
  })

  getInterviews = asyncHandler(async (req: Request, res: Response) => {
    const studentId = req.user?.id
    if (!studentId) {
      throw new AppError("Student ID not found in session", HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
    }

    const interviews = await this._getStudentInterviewsUseCase.execute(studentId)
    sendSuccess(res, interviews, MESSAGES.SUCCESS.INTERVIEWS_RETRIEVED);
  })

  getOffers = asyncHandler(async (req: Request, res: Response) => {
    const studentId = req.user?.id;
    if (!studentId) {
      throw new AppError("Student ID not found in session", HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
    }
    const offers = await this._getStudentOffersUseCase.execute(studentId);
    sendSuccess(res, offers, MESSAGES.SUCCESS.OFFERS_RETRIEVED);
  });

  respondToOffer = asyncHandler(async (req: Request, res: Response) => {
    const studentId = req.user?.id;
    if (!studentId) {
      throw new AppError("Student ID not found in session", HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
    }
    const { id } = req.params;
    const { status } = req.body;

    if (!['ACCEPTED', 'REJECTED'].includes(status)) {
      throw new AppError("Invalid status", HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
    }

    const offer = await this._respondToOfferUseCase.execute(studentId, id, status);
    sendSuccess(res, offer, `Offer ${status.toLowerCase()} successfully`);
  });

  downloadOfferPdf = asyncHandler(async (req: Request, res: Response) => {
    const studentId = req.user?.id;
    if (!studentId) {
      throw new AppError("Student ID not found in session", HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
    }
    const { id } = req.params;
    const pdfBuffer = await this._generateOfferPdfUseCase.execute(id);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Length': pdfBuffer.length,
      'Content-Disposition': `inline; filename="offer_${id}.pdf"`
    });

    res.send(pdfBuffer);
  });
}
