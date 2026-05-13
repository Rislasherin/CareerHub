import { Request, Response } from "express";
import { asyncHandler } from "@shared/utils/asyncHandler.util";
import { sendSuccess } from "@shared/utils/response.util";
import { IActivateInterviewerUseCase } from "@application/usecases/auth/interviewer/implementations/ActivateInterviewer.usecase";
import { LoginInterviewerUseCase } from "@application/usecases/auth/interviewer/implementations/LoginInterviewer.usecase";

import { IVerifyInterviewerTokenUseCase } from "@application/usecases/auth/interviewer/implementations/VerifyInterviewerToken.usecase";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";

export class InterviewerAuthController {
  constructor(
    private readonly activateUseCase: IActivateInterviewerUseCase,
    private readonly loginUseCase: LoginInterviewerUseCase,
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
      maxAge: 30 * 60 * 1000, // 30 minutes
    });

    sendSuccess(res, { user: result.user }, "Account activated successfully");
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.loginUseCase.execute(req.body);

    res.cookie("accessToken", result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 60 * 1000,
    });

    sendSuccess(res, result, "Login successful");
  });
}
