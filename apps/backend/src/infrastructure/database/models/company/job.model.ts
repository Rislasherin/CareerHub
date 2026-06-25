import { InferSchemaType, model, models } from "mongoose";
import { JobSchema } from "@infrastructure/database/schema/company/job.schema";

export type JobDocument = InferSchemaType<typeof JobSchema> & {
  _id: string;
};

export const JobModel =
  models.Job || model("Job", JobSchema);
