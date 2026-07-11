import { InferSchemaType, model, Document } from "mongoose";
import { NotificationSchema } from "../../schema/common/notification.schema";

export type INotificationDocument = InferSchemaType<typeof NotificationSchema> & Document & {
    _id: string;
    createdAt: Date;
    updatedAt: Date;
};

export const NotificationModel = model<INotificationDocument>('Notification', NotificationSchema);
