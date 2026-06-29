import { UpdatePlatformSettingsDTO } from "@application/dtos/super-admin/Request/platformSettings.request.dto";
import { PlatformSettings } from "@domain/entities/PlatformSettings";

export interface IUpdatePlatformSettingsUseCase {
    execute(dto:UpdatePlatformSettingsDTO): Promise<PlatformSettings>
}