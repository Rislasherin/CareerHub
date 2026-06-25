import { InferSchemaType, model, models } from "mongoose";
import { InterviewerSchema } from "@infrastructure/database/schema/company/interviewer.schema";

export type InterviewerDocument = InferSchemaType<typeof InterviewerSchema> & {
  _id: string;
};

export const InterviewerModel =
  models.Interviewer || model("Interviewer", InterviewerSchema);
