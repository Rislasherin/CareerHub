
import { Request, Response } from "express";
import { IGetPlatformSettingsUseCase } from "@application/usecases/super-admin/interfaces/IGetPlatformSettings.usecase";
import { IUpdatePlatformSettingsUseCase } from "@application/usecases/super-admin/interfaces/IUpdatePlatformSettings.usecase";
import { asyncHandler } from "@shared/utils/asyncHandler.util";
import { MESSAGES } from "@shared/constants/messages.constants";
import { sendSuccess } from "@shared/utils/response.util";

export class PlatformSettingsController {
    constructor(
        private readonly _getSettingsUseCase: IGetPlatformSettingsUseCase,
        private readonly _updateSettingsUseCase: IUpdatePlatformSettingsUseCase
    ) { }

    getSettings = asyncHandler(async (req: Request, res: Response) => {
        const settings = await this._getSettingsUseCase.execute();

        sendSuccess(res, settings.toJSON(), MESSAGES.SUCCESS.FETCHED);
    })

    updateSettings = asyncHandler(async (req: Request, res: Response) => {
        const updatedSettings = await this._updateSettingsUseCase.execute(req.body);

        sendSuccess(res, updatedSettings.toJSON(), MESSAGES.SUCCESS.UPDATED);
    })
}
