import { SubscriptionSchema } from "@infrastructure/database/schema/organization/subscription.schema";
import { InferSchemaType, model, models } from "mongoose";

export type SubscriptionDocument = InferSchemaType<typeof SubscriptionSchema> & { _id: string };

export const SubscriptionModel = models.Subscription || model("Subscription", SubscriptionSchema);
