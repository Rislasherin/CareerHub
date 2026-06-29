import { platformSettingsSchema } from "@infrastructure/database/schema/superadmin/platformSettings.schema";
import { InferSchemaType, model, models } from "mongoose";

export type PlatformSettingsDocument = InferSchemaType<typeof platformSettingsSchema> & {_id:string};

export const PlatformSettingsModel  = models.platformSettings || model("PlatformSettings",platformSettingsSchema);