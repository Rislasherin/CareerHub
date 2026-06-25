import { Request, Response } from "express";
import { asyncHandler } from "@shared/utils/asyncHandler.util";
import { sendSuccess } from "@shared/utils/response.util";
import { IRegisterOrganizationUseCase } from "@application/usecases/auth/organization/interfaces/IRegister.organization.usecase";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";

export class RegisterOrganizationController {
  constructor(private readonly _registerOrganizationUseCase: IRegisterOrganizationUseCase) {}

  register = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const result = await this._registerOrganizationUseCase.execute(req.body);
      sendSuccess(res, result, "Organization registration successful", HttpStatus.CREATED);
    }
  );
}