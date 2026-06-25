import { NoticeSchema } from "@infrastructure/database/schema/organization/notice.schema";
import { InferSchemaType, model, models } from "mongoose";


export type NoticeDocument = InferSchemaType<typeof NoticeSchema > & {_id:string};
export const NoticeModel = models.Notice || model("Notice",NoticeSchema)