import { InferSchemaType, model, models } from "mongoose";
import { PlanSchema } from "../../schema/organization/plan.schema";

export type PlanDocument = InferSchemaType<typeof PlanSchema> & { _id: string };

export const PlanModel = models.Plan || model("Plan", PlanSchema);
