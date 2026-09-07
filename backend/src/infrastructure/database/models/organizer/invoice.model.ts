import { InferSchemaType, model, models } from "mongoose";
import { InvoiceSchema } from "../../schema/organization/invoice.schema";

export type InvoiceDocument = InferSchemaType<typeof InvoiceSchema> & { _id: string };

export const InvoiceModel = models.Invoice || model("Invoice", InvoiceSchema);
