import { Request, Response } from "express";
import { asyncHandler } from "@shared/utils/asyncHandler.util";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { IGetHRProfileUseCase } from "@application/usecases/hr/settings/implementations/GetHRProfile.usecase";
import { IUpdateHRProfileUseCase } from "@application/usecases/hr/settings/implementations/UpdateHRProfile.usecase";
import { IChangeHRPasswordUseCase } from "@application/usecases/hr/settings/implementations/ChangeHRPassword.usecase";
import { IRequestHREmailChangeUseCase } from "@application/usecases/hr/settings/implementations/RequestHREmailChange.usecase";
import { IVerifyHREmailChangeUseCase } from "@application/usecases/hr/settings/implementations/VerifyHREmailChange.usecase";
import { IGetCompanyProfileUseCase } from "@application/usecases/hr/settings/implementations/GetCompanyProfile.usecase";
import { IUpdateCompanyProfileUseCase } from "@application/usecases/hr/settings/implementations/UpdateCompanyProfile.usecase";

export class HRSettingsController {
  constructor(
    private readonly _getHRProfileUseCase: IGetHRProfileUseCase,
    private readonly _updateHRProfileUseCase: IUpdateHRProfileUseCase,
    private readonly _changeHRPasswordUseCase: IChangeHRPasswordUseCase,
    private readonly _requestHREmailChangeUseCase: IRequestHREmailChangeUseCase,
    private readonly _verifyHREmailChangeUseCase: IVerifyHREmailChangeUseCase,
    private readonly _getCompanyProfileUseCase: IGetCompanyProfileUseCase,
    private readonly _updateCompanyProfileUseCase: IUpdateCompanyProfileUseCase
  ) {}

  getProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const profile = await this._getHRProfileUseCase.execute(userId!);
    res.status(HttpStatus.OK).json({ success: true, data: profile });
  });

  updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const profile = await this._updateHRProfileUseCase.execute(userId!, req.body);
    res.status(HttpStatus.OK).json({ success: true, data: profile, message: "Profile updated successfully" });
  });

  changePassword = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    await this._changeHRPasswordUseCase.execute(userId!, req.body);
    res.status(HttpStatus.OK).json({ success: true, message: "Password updated successfully" });
  });

  requestEmailChange = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    await this._requestHREmailChangeUseCase.execute(userId!, req.body);
    res.status(HttpStatus.OK).json({ success: true, message: "Verification email sent" });
  });

  verifyEmailChange = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    await this._verifyHREmailChangeUseCase.execute(userId!, req.body);
    res.status(HttpStatus.OK).json({ success: true, message: "Email updated successfully" });
  });

  getCompanyProfile = asyncHandler(async (req: Request, res: Response) => {
    const companyId = req.user?.companyId;
    const profile = await this._getCompanyProfileUseCase.execute(companyId!);
    res.status(HttpStatus.OK).json({ success: true, data: profile });
  });

  updateCompanyProfile = asyncHandler(async (req: Request, res: Response) => {
    const companyId = req.user?.companyId;
    const profile = await this._updateCompanyProfileUseCase.execute(companyId!, req.body);
    res.status(HttpStatus.OK).json({ success: true, data: profile, message: "Company profile updated successfully" });
  });
}
