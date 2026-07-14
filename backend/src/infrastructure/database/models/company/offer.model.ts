import { InferSchemaType, model } from "mongoose";
import { OfferSchema } from "../../schema/company/offer.schema";

export type OfferDocument = InferSchemaType<typeof OfferSchema> & {_id: string}
export const OfferModel = model<OfferDocument>('Offer', OfferSchema);
