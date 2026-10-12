import { Request, Response } from "express";
import { asyncHandler } from "@shared/utils/asyncHandler.util";
import { sendSuccess } from "@shared/utils/response.util";
import { IRegisterOrganizationUseCase } from "@application/usecases/auth/organization/interfaces/IRegister.organization.usecase";
import { IVerifyCollegeOtpUseCase } from "@application/usecases/auth/organization/interfaces/IVerifyCollegeOtp.usecase";
import { ILoginCollegeAdminUseCase } from "@application/usecases/auth/organization/interfaces/ILoginCollegeAdmin.usecase";
import { IUpdateCollegeOnboardingUseCase } from "@application/usecases/auth/organization/interfaces/IUpdateCollegeOnboarding.usecase";
import { IUploadCollegeVerificationDocumentUseCase } from "@application/usecases/auth/organization/implementations/UploadCollegeVerificationDocument.usecase";
import { IDeleteCollegeVerificationDocumentUseCase } from "@application/usecases/auth/organization/implementations/DeleteCollegeVerificationDocument.usecase";
import { AppError } from "@application/errors/AppError";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { env } from "@infrastructure/config/env.validator";
import { MESSAGES } from "@shared/constants/messages.constants";

export class CollegeAdminAuthController {
  constructor(
    private readonly _registerUseCase: IRegisterOrganizationUseCase,
    private readonly _verifyOtpUseCase: IVerifyCollegeOtpUseCase,
    private readonly _loginUseCase: ILoginCollegeAdminUseCase,
    private readonly _updateOnboardingUseCase: IUpdateCollegeOnboardingUseCase,
    private readonly _uploadVerificationDocUseCase?: IUploadCollegeVerificationDocumentUseCase,
    private readonly _deleteVerificationDocUseCase?: IDeleteCollegeVerificationDocumentUseCase
  ) { }

  login = asyncHandler(async (req: Request, res: Response) => {
    const result = await this._loginUseCase.execute(req.body);

    res.cookie("accessToken", result.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: env.COOKIE_MAX_AGE_MS,
    });

    if (result.refreshToken) {
      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: env.REFRESH_COOKIE_MAX_AGE_MS,
      });
    }

    sendSuccess(res, result, MESSAGES.SUCCESS.LOGIN);
  });

  register = asyncHandler(async (req: Request, res: Response) => {
    const result = await this._registerUseCase.execute(req.body);
    sendSuccess(res, result, MESSAGES.SUCCESS.OTP_SENT, HttpStatus.CREATED);
  });

  verifyOtp = asyncHandler(async (req: Request, res: Response) => {
    const result = await this._verifyOtpUseCase.execute(req.body);

    res.cookie("accessToken", result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: env.COOKIE_MAX_AGE_MS,
    });

    if (result.refreshToken) {
      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: env.REFRESH_COOKIE_MAX_AGE_MS,
      });
    }

    sendSuccess(
      res,
      {
        collegeAdmin: result.collegeAdmin,
      },
      MESSAGES.SUCCESS.OTP_VERIFIED,
      HttpStatus.OK
    );
  });

  updateOnboarding = asyncHandler(async (req: Request, res: Response) => {
    const { orgId } = req.user as unknown as Record<string, unknown>; // From auth middleware
    const result = await this._updateOnboardingUseCase.execute(orgId as string, req.body);
    sendSuccess(res, result, MESSAGES.SUCCESS.ONBOARDING_UPDATED);
  });

  resubmit = asyncHandler(async (req: Request, res: Response) => {
    const { orgId } = req.user as unknown as Record<string, unknown>;
    const payload = { ...req.body, step: 3, resubmit: true };
    const result = await this._updateOnboardingUseCase.execute(orgId as string, payload);
    sendSuccess(res, result, "Application resubmitted successfully for review");
  });

  uploadVerificationDocument = asyncHandler(async (req: Request, res: Response) => {
    const orgId = req.user?.orgId;
    if (!orgId) {
      throw new AppError(MESSAGES.ERROR.UNAUTHORIZED, HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
    }
    if (!this._uploadVerificationDocUseCase) {
      throw new AppError("Upload service not configured", HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.INTERNAL_ERROR);
    }

    const result = await this._uploadVerificationDocUseCase.execute(
      orgId,
      req.file,
      req.body.category
    );

    sendSuccess(res, result, "Verification document uploaded successfully", HttpStatus.CREATED);
  });

  deleteVerificationDocument = asyncHandler(async (req: Request, res: Response) => {
    const orgId = req.user?.orgId;
    if (!orgId) {
      throw new AppError(MESSAGES.ERROR.UNAUTHORIZED, HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
    }
    const documentId = req.params.id;
    if (!documentId) {
      throw new AppError("Document ID is required", HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
    }
    if (!this._deleteVerificationDocUseCase) {
      throw new AppError("Delete service not configured", HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.INTERNAL_ERROR);
    }

    const updatedOrg = await this._deleteVerificationDocUseCase.execute(orgId, documentId);
    sendSuccess(res, updatedOrg, "Verification document removed successfully");
  });
}
