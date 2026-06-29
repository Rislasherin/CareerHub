
import { PlatformSettingsRepository } from "@infrastructure/repositories/PlatformSettingsRepository";
import { IUpdatePlatformSettingsUseCase } from "../interfaces/IUpdatePlatformSettings.usecase";
import { UpdatePlatformSettingsDTO } from "@application/dtos/super-admin/Request/platformSettings.request.dto";
import { PlatformSettings } from "@domain/entities/PlatformSettings";

export class UpdatePlatformSettingsUseCase implements IUpdatePlatformSettingsUseCase {
    constructor(private readonly _platformSettingsRepository:PlatformSettingsRepository){}

    async execute(dto: UpdatePlatformSettingsDTO): Promise<PlatformSettings> {

        let settings = await this._platformSettingsRepository.getSettings();
        if(!settings || !settings.id) throw new Error("Settings not found");

        console.log("RECEIVED DTO:", dto);

        // Update Entity
        if (dto.maintenanceMode !== undefined) settings.maintenanceMode = dto.maintenanceMode;
        if (dto.maintenanceMessage !== undefined) settings.maintenanceMessage = dto.maintenanceMessage;
        if (dto.collegeRegistration !== undefined) settings.collegeRegistration = dto.collegeRegistration;
        if (dto.companyRegistration !== undefined) settings.companyRegistration = dto.companyRegistration;
        if (dto.studentRegistration !== undefined) settings.studentRegistration = dto.studentRegistration;
        if (dto.requireApproval !== undefined) settings.requireApproval = dto.requireApproval;
        if (dto.contactEmail !== undefined) settings.contactEmail = dto.contactEmail;

        const updateSettings = await this._platformSettingsRepository.update(settings.id,settings);

        return updateSettings;
    }
}
