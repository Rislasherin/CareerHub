import { Request, Response } from "express";
import { asyncHandler } from "@shared/utils/asyncHandler.util";
import { sendSuccess } from "@shared/utils/response.util";
import { IForgotPasswordUseCase } from "@application/usecases/auth/shared/ForgotPassword.usecase";

import { IResetPasswordUseCase } from "@application/usecases/auth/shared/ResetPassword.usecase";

export class ForgotPasswordController {
  constructor(
    private readonly _forgotPasswordUseCase: IForgotPasswordUseCase,
    private readonly _resetPasswordUseCase: IResetPasswordUseCase
  ) {}

  forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;
    await this._forgotPasswordUseCase.execute(email);
    sendSuccess(res, null, "If an account exists with that email, a password reset link has been sent.");
  });

  resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const { token, password } = req.body;
    await this._resetPasswordUseCase.execute(token, password);
    sendSuccess(res, null, "Password reset successfully.");
  });
}
