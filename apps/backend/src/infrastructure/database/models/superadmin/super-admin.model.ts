import { InferSchemaType, model, models } from "mongoose";
import { SuperAdminSchema } from "@infrastructure/database/schema/superadmin/super-admin.schema";

export type SuperAdminDocument = InferSchemaType<typeof SuperAdminSchema> & {
  _id: string;
};

export const SuperAdminModel =
  models.SuperAdmin || model("SuperAdmin", SuperAdminSchema);
