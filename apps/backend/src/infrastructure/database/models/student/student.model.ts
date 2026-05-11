import { InferSchemaType, model, models } from "mongoose";
import { studentSchema } from "@infrastructure/database/schema/student/student.schema";

export type StudentDocument = InferSchemaType<typeof studentSchema> & { _id: string };

export const StudentModel = models.Student || model("Student", studentSchema);
