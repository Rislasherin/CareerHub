import { Request, Response } from "express";
import { asyncHandler } from "@shared/utils/asyncHandler.util";
import { sendSuccess } from "@shared/utils/response.util";
import { IForgotPasswordUseCase } from "@application/usecases/auth/shared/interfaces/IForgotPassword.usecase";;

import { IResetPasswordUseCase } from "@application/usecases/auth/shared/interfaces/IResetPassword.usecase";;
import { errorMonitor } from "events";
import { logger } from "@infrastructure/logger/logger";

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
    sendSuccess(res, null, "Password reset successfully.")
  });
}
