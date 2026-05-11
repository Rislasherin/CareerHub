import { Request, Response } from "express";
import { asyncHandler } from "@shared/utils/asyncHandler.util";
import { sendSuccess } from "@shared/utils/response.util";
import { ILoginStudentUsescase } from "@application/usecases/auth/student/interfaces/ILogin.student.usecase";
import { IRegisterStudentUseCase } from "@application/usecases/auth/student/interfaces/IRegister.student.usecase";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";

export class StudentAuthController {
  constructor(
    private readonly loginUseCase: ILoginStudentUsescase,
    private readonly registerUseCase: IRegisterStudentUseCase
  ) { }

  login = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.loginUseCase.execute(req.body);

    res.cookie("accessToken", result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 60 * 1000,
    });

    sendSuccess(
      res,
      {
        student: result.student,
        isFirstLogin: result.student.isFirstLogin,
      },
      "student login successful"
    );
  });

  register = asyncHandler(async (req: Request, res: Response) => {
    await this.registerUseCase.execute(req.body);
    sendSuccess(res, null, "Student registered successfully. Please wait for college approval.", HttpStatus.CREATED);
  });
}
