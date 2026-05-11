import { Request, Response } from "express";
import { asyncHandler } from "@shared/utils/asyncHandler.util";
import { sendSuccess } from "@shared/utils/response.util";
import { RegisterOrganizationUseCase } from "@application/usecases/auth/organization/implementations/register.organization.usecase";

export class RegisterOrganizationController {
  constructor(private readonly _registerOrganizationUseCase: RegisterOrganizationUseCase) {}

  register = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const result = await this._registerOrganizationUseCase.execute(req.body);
      sendSuccess(res, result, "Organization registration successful", 201);
    }
  );
}