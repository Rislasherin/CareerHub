import { Request, Response } from "express";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { asyncHandler } from "@shared/utils/asyncHandler.util";
import { sendSuccess } from "@shared/utils/response.util";
import { ILoginStudentUsescase } from "@application/usecases/auth/student/interfaces/ILogin.student.usecase";
import { IRequestAccessUseCase } from "@application/usecases/auth/student/interfaces/IRequestAccess.usecase";
import { IGetStudentProfileUseCase } from "@application/usecases/auth/student/interfaces/IGetStudentProfile.usecase";
import { IVerifyInvitationTokenUseCase } from "@application/usecases/auth/student/interfaces/IVerifyInvitationToken.usecase";
import { ISetupStudentPasswordUseCase } from "@application/usecases/auth/student/interfaces/ISetupStudentPassword.usecase";
import { env } from "@infrastructure/config/env.validator";

export class StudentAuthController {
  constructor(
    private readonly _loginUseCase: ILoginStudentUsescase,

    private readonly _requestAccessUseCase: IRequestAccessUseCase,
    private readonly _setupPasswordUseCase: ISetupStudentPasswordUseCase,
    private readonly _getProfileUseCase: IGetStudentProfileUseCase,
    private readonly _verifyTokenUseCase: IVerifyInvitationTokenUseCase
  ) { }

  verifyInvitationToken = asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.params;
    const student = await this._verifyTokenUseCase.execute(token);
    sendSuccess(res, student, "Token verified successfully");
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

    sendSuccess(
      res,
      {
        student: result.student,
        isFirstLogin: result.student.isFirstLogin,
      },
      "student login successful"
    );
  });

  getMe = asyncHandler(async (req: Request, res: Response) => {
    const studentId = req.user?.id;
    const student = await this._getProfileUseCase.execute(studentId as string);
    sendSuccess(res, student, "Student profile retrieved successfully");
  });

  requestAccess = asyncHandler(async (req: Request, res: Response) => {
    await this._requestAccessUseCase.execute(req.body);
    sendSuccess(res, null, "Request submitted. Please wait for college admin review.", HttpStatus.CREATED);
  });

  setupPassword = asyncHandler(async (req: Request, res: Response) => {
    const { token, password } = req.body;
    const result = await this._setupPasswordUseCase.execute(token, password);

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

    sendSuccess(res, result, "Password set successfully. Profile activated.");
  });
}
