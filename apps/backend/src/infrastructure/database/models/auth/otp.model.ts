import { InferSchemaType, model, models } from "mongoose";
import { OtpSchema } from "@infrastructure/database/schema/auth/otp.schema";

export type OtpDocument = InferSchemaType<typeof OtpSchema> & {
  _id: string;
};

export const OtpModel = models.Otp || model("Otp", OtpSchema);
