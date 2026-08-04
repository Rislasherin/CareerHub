import { InferSchemaType, model } from "mongoose";
import { ResumeSchema } from "../../schema/student/resume.schema";

export type ResumeDocument = InferSchemaType<typeof ResumeSchema> & { _id: string };
export const ResumeModel = model<ResumeDocument>('Resume', ResumeSchema);
