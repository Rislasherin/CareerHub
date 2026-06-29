import { PlatformSettingsResponseDTO } from "@application/dtos/super-admin/Response/platformSettings.response.dto";
import { PlatformSettings } from "@domain/entities/PlatformSettings";

export interface IGetPlatformSettingsUseCase {
    execute():Promise<PlatformSettings>;
}
