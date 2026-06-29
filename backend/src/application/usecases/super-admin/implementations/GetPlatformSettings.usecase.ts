import { PlatformSettingsRepository } from "@infrastructure/repositories/PlatformSettingsRepository";
import { IGetPlatformSettingsUseCase } from "../interfaces/IGetPlatformSettings.usecase";
import { PlatformSettingsResponseDTO } from "@application/dtos/super-admin/Response/platformSettings.response.dto";
import { PlatformSettings } from "@domain/entities/PlatformSettings";

export class GetPlatformSettingsUseCase implements IGetPlatformSettingsUseCase {
    constructor(private readonly _platformSettingsRespository:PlatformSettingsRepository){}

    async execute(): Promise<PlatformSettings> {
        let settings = await this._platformSettingsRespository.getSettings();
        if(!settings) throw new Error("Could not initialize platform settings");
        return settings;
    }
}