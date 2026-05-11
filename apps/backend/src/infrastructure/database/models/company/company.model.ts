import { InferSchemaType, model, models } from "mongoose";
import { CompanySchema } from "@infrastructure/database/schema/company/company.schema";

export type CompanyDocument = InferSchemaType<typeof CompanySchema> & {
  _id: string;
};

export const CompanyModel =
  models.Company || model("Company", CompanySchema);
