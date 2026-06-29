import { PlatformSettings } from "@domain/entities/PlatformSettings";
import { IBaseRepository } from "./IBaseRepository";

export interface IPlatformSettingsRepository extends IBaseRepository<PlatformSettings> {
    getSettings():Promise<PlatformSettings | null>
}