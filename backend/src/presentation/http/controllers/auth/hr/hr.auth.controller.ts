import { Request, Response } from "express";
import { asyncHandler } from "@shared/utils/asyncHandler.util";
import { sendSuccess } from "@shared/utils/response.util";
import { IRegisterCompanyUseCase } from "@application/usecases/auth/hr/interfaces/IRegisterCompany.usecase";
import { IUpdateCompanyOnboardingUseCase } from "@application/usecases/auth/hr/interfaces/IUpdateCompanyOnboarding.usecase";
import { IVerifyCompanyOtpUseCase } from "@application/usecases/auth/hr/interfaces/IVerifyCompanyOtp.usecase";
import { ILoginHRUseCase } from "@application/usecases/auth/hr/interfaces/ILoginHR.usecase";
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
    private readonly _loginUseCase: ILoginHRUseCase
  ) { }

  login = asyncHandler(async (req: Request, res: Response) => {
    const result = await this._loginUseCase.execute(req.body);

    res.cookie("accessToken", result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: env.COOKIE_MAX_AGE_MS,
    });

    if (result.refreshToken) {
      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
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
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
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
}
