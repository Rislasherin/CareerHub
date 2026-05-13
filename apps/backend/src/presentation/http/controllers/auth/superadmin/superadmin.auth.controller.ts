import { Request, Response } from "express";
import { asyncHandler } from "@shared/utils/asyncHandler.util";
import { sendSuccess } from "@shared/utils/response.util";
import { LoginSuperAdminUseCase } from "@application/usecases/auth/superadmin/implementations/LoginSuperAdmin.usecase";

export class SuperAdminAuthController {
  constructor(private readonly _loginUseCase: LoginSuperAdminUseCase) {}

  login = asyncHandler(async (req: Request, res: Response) => {
    const result = await this._loginUseCase.execute(req.body);

    res.cookie("accessToken", result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 60 * 1000,
    });

    sendSuccess(res, result, "Login successful");
  });
}
