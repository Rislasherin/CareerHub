import { Request, Response, NextFunction } from "express";
import { IGetCollegeProfileUseCase } from "@application/usecases/college/settings/interfaces/IGetCollegeProfile.usecase";
import { IUpdateCollegeProfileUseCase } from "@application/usecases/college/settings/interfaces/IUpdateCollegeProfile.usecase";
import { IChangeCollegePasswordUseCase } from "@application/usecases/college/settings/interfaces/IChangeCollegePassword.usecase";
import { IRequestCollegeEmailChangeUseCase } from "@application/usecases/college/settings/interfaces/IRequestCollegeEmailChange.usecase";
import { IVerifyCollegeEmailChangeUseCase } from "@application/usecases/college/settings/interfaces/IVerifyCollegeEmailChange.usecase";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";

export class CollegeSettingsController {
  constructor(
    private readonly _getProfileUseCase: IGetCollegeProfileUseCase,
    private readonly _updateProfileUseCase: IUpdateCollegeProfileUseCase,
    private readonly _changePasswordUseCase: IChangeCollegePasswordUseCase,
    private readonly _requestEmailChangeUseCase: IRequestCollegeEmailChangeUseCase,
    private readonly _verifyEmailChangeUseCase: IVerifyCollegeEmailChangeUseCase
  ) {}

  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.user?.orgId;
      const adminId = req.user?.id;
      
      if (!orgId || !adminId) {
        res.status(401).json({ success: false, message: "Unauthorized: Invalid session context." });
        return;
      }

      const data = await this._getProfileUseCase.execute(orgId, adminId);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.user?.orgId;
      const adminId = req.user?.id;

      if (!orgId || !adminId) {
        res.status(401).json({ success: false, message: "Unauthorized: Invalid session context." });
        return;
      }

      await this._updateProfileUseCase.execute(orgId, adminId, req.body);
      res.status(200).json({ success: true, message: "Profile updated successfully." });
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const adminId = req.user?.id;

      if (!adminId) {
        res.status(401).json({ success: false, message: "Unauthorized: Invalid session context." });
        return;
      }

      await this._changePasswordUseCase.execute(adminId, req.body);
      res.status(200).json({ success: true, message: "Password updated successfully." });
    } catch (error) {
      next(error);
    }
  }

  async requestEmailChange(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const adminId = req.user?.id;

      if (!adminId) {
        res.status(401).json({ success: false, message: "Unauthorized: Invalid session context." });
        return;
      }

      await this._requestEmailChangeUseCase.execute(adminId, req.body);
      res.status(200).json({ success: true, message: "Verification code sent to your new email." });
    } catch (error) {
      next(error);
    }
  }

  async verifyEmailChange(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const adminId = req.user?.id;

      if (!adminId) {
        res.status(401).json({ success: false, message: "Unauthorized: Invalid session context." });
        return;
      }

      await this._verifyEmailChangeUseCase.execute(adminId, req.body);
      res.status(200).json({ success: true, message: "Email updated successfully." });
    } catch (error) {
      next(error);
    }
  }
}
