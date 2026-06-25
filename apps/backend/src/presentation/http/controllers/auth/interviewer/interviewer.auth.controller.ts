import { Request, Response } from "express";
import { asyncHandler } from "@shared/utils/asyncHandler.util";
import { sendSuccess } from "@shared/utils/response.util";
import { IActivateInterviewerUseCase } from "@application/usecases/auth/interviewer/implementations/ActivateInterviewer.usecase";
import { ILoginInterviewerUseCase } from "@application/usecases/auth/interviewer/interfaces/ILoginInterviewer.usecase";

import { IVerifyInterviewerTokenUseCase } from "@application/usecases/auth/interviewer/implementations/VerifyInterviewerToken.usecase";
import { env } from "@infrastructure/config/env.validator";

export class InterviewerAuthController {
  constructor(
    private readonly activateUseCase: IActivateInterviewerUseCase,
    private readonly _loginUseCase: ILoginInterviewerUseCase,
    private readonly verifyTokenUseCase: IVerifyInterviewerTokenUseCase
  ) {}

  verifyToken = asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.params;
    const result = await this.verifyTokenUseCase.execute(token);
    sendSuccess(res, result, "Token verified successfully");
  });

  activate = asyncHandler(async (req: Request, res: Response) => {
    // @ts-ignore
    const interviewerId = req.user.id;
    const { password } = req.body;
    const email = req.query.email as string;
    const result = await this.activateUseCase.execute(interviewerId, password, email);
    
    res.cookie("accessToken", result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: env.COOKIE_MAX_AGE_MS, 
    });

    sendSuccess(res, { user: result.user }, "Account activated successfully");
  });

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

    sendSuccess(res, result, "Login successful");
  });
}
