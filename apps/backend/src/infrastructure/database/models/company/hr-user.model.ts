import { InferSchemaType, model, models } from "mongoose";
import { HRUserSchema } from "@infrastructure/database/schema/company/hr-user.schema";

export type HRUserDocument = InferSchemaType<typeof HRUserSchema> & {
  _id: string;
};

export const HRUserModel =
  models.HRUser || model("HRUser", HRUserSchema);
