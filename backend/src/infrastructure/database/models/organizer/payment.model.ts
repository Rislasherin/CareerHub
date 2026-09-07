import { InferSchemaType, model, models } from "mongoose";
import { PaymentSchema } from "../../schema/organization/payment.schema";

export type PaymentDocument = InferSchemaType<typeof PaymentSchema> & { _id: string };

export const PaymentModel = models.Payment || model("Payment", PaymentSchema);
