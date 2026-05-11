import { InferSchemaType, model, models } from "mongoose";
import { CollegeAdminSchema } from "@infrastructure/database/schema/organization/college-admin.schema";

export type CollegeAdminDocument =
  InferSchemaType<typeof CollegeAdminSchema> & {
    _id: string;
  };

export const CollegeAdminModel =
  models.CollegeAdmin ||
  model("CollegeAdmin", CollegeAdminSchema);