import { Request, Response } from "express";
import { asyncHandler } from "@shared/utils/asyncHandler.util";
import { sendSuccess } from "@shared/utils/response.util";
import { IRegisterCompanyUseCase } from "@application/usecases/auth/hr/interfaces/IRegisterCompany.usecase";
import { IUpdateCompanyOnboardingUseCase } from "@application/usecases/auth/hr/interfaces/IUpdateCompanyOnboarding.usecase";
import { IVerifyCompanyOtpUseCase } from "@application/usecases/auth/hr/interfaces/IVerifyCompanyOtp.usecase";
import { ILoginHRUseCase } from "@application/usecases/auth/hr/interfaces/ILoginHR.usecase";
import { IUploadCompanyVerificationDocumentUseCase } from "@application/usecases/auth/hr/implementations/UploadCompanyVerificationDocument.usecase";
import { IDeleteCompanyVerificationDocumentUseCase } from "@application/usecases/auth/hr/implementations/DeleteCompanyVerificationDocument.usecase";
import { AppError } from "@application/errors/AppError";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { env } from "@infrastructure/config/env.validator";
import { MESSAGES } from "@shared/constants/messages.constants";

export class HRAuthController {
  constructor(
    private readonly _registerUseCase: IRegisterCompanyUseCase,
    private readonly _onboardingUseCase: IUpdateCompanyOnboardingUseCase,
    private readonly _verifyOtpUseCase: IVerifyCompanyOtpUseCase,
    private readonly _loginUseCase: ILoginHRUseCase,
    private readonly _uploadVerificationDocUseCase?: IUploadCompanyVerificationDocumentUseCase,
    private readonly _deleteVerificationDocUseCase?: IDeleteCompanyVerificationDocumentUseCase
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

    sendSuccess(
      res,
      {
        hrUser: result.hrUser,
        company: result.company,
      },
      MESSAGES.SUCCESS.OTP_VERIFIED,
      HttpStatus.OK
    );
  });

  updateOnboarding = asyncHandler(async (req: Request, res: Response) => {
    const companyId = req.user?.companyId;

    if (!companyId) {
      throw new AppError(MESSAGES.ERROR.UNAUTHORIZED, HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
    }

    const company = await this._onboardingUseCase.execute(companyId, req.body);
    sendSuccess(res, company, MESSAGES.SUCCESS.ONBOARDING_UPDATED);
  });

  resubmit = asyncHandler(async (req: Request, res: Response) => {
    const companyId = req.user?.companyId;

    if (!companyId) {
      throw new AppError(MESSAGES.ERROR.UNAUTHORIZED, HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
    }

    const company = await this._onboardingUseCase.execute(companyId, {
      ...req.body,
      step: 3,
      resubmit: true
    });
    sendSuccess(res, company, "Company application resubmitted successfully for review");
  });

  uploadVerificationDocument = asyncHandler(async (req: Request, res: Response) => {
    const companyId = req.user?.companyId;
    if (!companyId) {
      throw new AppError(MESSAGES.ERROR.UNAUTHORIZED, HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
    }
    if (!this._uploadVerificationDocUseCase) {
      throw new AppError("Upload service not configured", HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.INTERNAL_ERROR);
    }

    const result = await this._uploadVerificationDocUseCase.execute(
      companyId,
      req.file,
      req.body.category
    );

    sendSuccess(res, result, "Verification document uploaded successfully", HttpStatus.CREATED);
  });

  deleteVerificationDocument = asyncHandler(async (req: Request, res: Response) => {
    const companyId = req.user?.companyId;
    if (!companyId) {
      throw new AppError(MESSAGES.ERROR.UNAUTHORIZED, HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
    }
    const documentId = req.params.id;
    if (!documentId) {
      throw new AppError("Document ID is required", HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
    }
    if (!this._deleteVerificationDocUseCase) {
      throw new AppError("Delete service not configured", HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.INTERNAL_ERROR);
    }

    const updatedCompany = await this._deleteVerificationDocUseCase.execute(companyId, documentId);
    sendSuccess(res, updatedCompany, "Verification document removed successfully");
  });
}
