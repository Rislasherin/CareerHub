import { PlatformSettings } from "@domain/entities/PlatformSettings";
import { BaseRepository } from "./BaseRepository";
import { PlatformSettingsDocument, PlatformSettingsModel } from "@infrastructure/database/models/superadmin/platformSettings.model";
import { IPlatformSettingsRepository } from "@domain/repositories/IPlatformSettingsRepository";
import { toPlatformSettingsEntity, toPlatformSettingsPersistence } from "@application/mappers/platformSettings.mapper";

export class PlatformSettingsRepository extends BaseRepository<PlatformSettings,PlatformSettingsDocument> 
implements IPlatformSettingsRepository {
    constructor(){
        super(PlatformSettingsModel);
    }

    protected toEntity(doc: PlatformSettingsDocument): PlatformSettings {
        return toPlatformSettingsEntity(doc)
    }

    protected toPersistence(entity: PlatformSettings): Record<string, unknown> {
        return toPlatformSettingsPersistence(entity)
    }

    async getSettings(): Promise<PlatformSettings | null> {

        let doc = await this.model.findOne();
        if(!doc) {
            const defaultSettings = new this.model({})
            doc = await defaultSettings.save();
        }
        return this.toEntity(doc as PlatformSettingsDocument)
    }
}