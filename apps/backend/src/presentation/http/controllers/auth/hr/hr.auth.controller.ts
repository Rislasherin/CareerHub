import { Request, Response } from "express";
import { asyncHandler } from "@shared/utils/asyncHandler.util";
import { sendSuccess } from "@shared/utils/response.util";
import { IRegisterCompanyUseCase } from "@application/usecases/auth/hr/implementations/RegisterCompany.usecase";
import { IUpdateCompanyOnboardingUseCase } from "@application/usecases/auth/hr/implementations/UpdateCompanyOnboarding.usecase";
import { AppError } from "@application/errors/AppError";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";

export class HRAuthController {
  constructor(
    private readonly registerUseCase: IRegisterCompanyUseCase,
    private readonly onboardingUseCase: IUpdateCompanyOnboardingUseCase
  ) {}

  register = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.registerUseCase.execute(req.body);

    res.cookie("accessToken", result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 60 * 1000,
    });

    sendSuccess(
      res,
      {
        hrUser: result.hrUser,
        company: result.company,
      },
      "Company registration (Step 1) successful",
      201
    );
  });

  updateOnboarding = asyncHandler(async (req: any, res: Response) => {
    const companyId = req.user?.companyId;

    if (!companyId) {
      throw new AppError("Company ID not found in session", HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
    }

    const company = await this.onboardingUseCase.execute(companyId, req.body);
    sendSuccess(res, company, `Company onboarding Step ${req.body.step} successful`);
  });
}
