import { Request, Response } from "express";
import { asyncHandler } from "@shared/utils/asyncHandler.util";
import { sendSuccess } from "@shared/utils/response.util";
import { RegisterOrganizationUseCase } from "@application/usecases/auth/organization/implementations/register.organization.usecase";
import { VerifyCollegeOtpUseCase } from "@application/usecases/auth/organization/implementations/VerifyCollegeOtp.usecase";

import { LoginCollegeAdminUseCase } from "@application/usecases/auth/organization/implementations/LoginCollegeAdmin.usecase";
import { UpdateCollegeOnboardingUseCase } from "@application/usecases/auth/organization/implementations/UpdateCollegeOnboarding.usecase";
import { env } from "@infrastructure/config/env.validator";

export class CollegeAdminAuthController {
  constructor(
    private readonly _registerUseCase: RegisterOrganizationUseCase,
    private readonly _verifyOtpUseCase: VerifyCollegeOtpUseCase,
    private readonly _loginUseCase: LoginCollegeAdminUseCase,
    private readonly _updateOnboardingUseCase: UpdateCollegeOnboardingUseCase
  ) { }

  login = asyncHandler(async (req: Request, res: Response) => {
    const result = await this._loginUseCase.execute(req.body);

    res.cookie("accessToken", result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: env.COOKIE_MAX_AGE_MS,
    });

    sendSuccess(res, result, "Login successful");
  });

  register = asyncHandler(async (req: Request, res: Response) => {
    const result = await this._registerUseCase.execute(req.body);
    sendSuccess(res, result, "OTP sent successfully", 201);
  });

  verifyOtp = asyncHandler(async (req: Request, res: Response) => {
    const result = await this._verifyOtpUseCase.execute(req.body);

    res.cookie("accessToken", result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: env.COOKIE_MAX_AGE_MS,
    });

    sendSuccess(
      res,
      {
        collegeAdmin: result.collegeAdmin,
      },
      "OTP verification successful",
      200
    );
  });

  updateOnboarding = asyncHandler(async (req: Request, res: Response) => {
    const { orgId } = (req as any).user; // From auth middleware
    const result = await this._updateOnboardingUseCase.execute(orgId, req.body);
    sendSuccess(res, result, "Onboarding updated successfully");
  });
}
