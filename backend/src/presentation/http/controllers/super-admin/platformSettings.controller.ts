// 1. ADD THIS IMPORT!
import { Request, Response } from "express";
import { GetPlatformSettingsUseCase } from "@application/usecases/super-admin/implementations/GetPlatformSettings.usecase";
import { UpdatePlatformSettingsUseCase } from "@application/usecases/super-admin/implementations/UpdatePlatformSettings.usecase";
import { asyncHandler } from "@shared/utils/asyncHandler.util";
import { sendSuccess } from "@shared/utils/response.util";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";

export class PlatformSettingsController {
    constructor(
        private readonly _getSettingsUseCase: GetPlatformSettingsUseCase,
        private readonly _updateSettingsUseCase: UpdatePlatformSettingsUseCase
    ) { }

    getSettings = asyncHandler(async (req: Request, res: Response) => {
        const settings = await this._getSettingsUseCase.execute();

        sendSuccess(res, settings.toJSON(), "Platform settings fetched successfully");
    })

    updateSettings = asyncHandler(async (req: Request, res: Response) => {
        const updatedSettings = await this._updateSettingsUseCase.execute(req.body);

        sendSuccess(res, updatedSettings.toJSON(), "Platform settings updated successfully");
    })
}
