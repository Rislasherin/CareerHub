import { InferSchemaType, model, models } from "mongoose";
import { AIUsageRecordSchema } from "../../schema/ai/aiUsageRecord.schema";

export type AIUsageRecordDocument = InferSchemaType<typeof AIUsageRecordSchema> & { _id: string };

export const AIUsageRecordModel = models.AIUsageRecord || model("AIUsageRecord", AIUsageRecordSchema);
