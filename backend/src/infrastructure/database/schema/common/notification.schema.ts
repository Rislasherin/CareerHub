import { Schema } from "mongoose";
import { NotificationRole } from "@domain/enums/NotificationRole.enum";
import { NotificationType } from "@domain/enums/NotificationType.enum";

export const NotificationSchema = new Schema(
    {
        recipientId: { type: Schema.Types.ObjectId, required: true },
        role: { type: String, enum: Object.values(NotificationRole), required: true },
        title: { type: String, required: true },
        message: { type: String, required: true },
        type: { type: String, enum: Object.values(NotificationType), required: true },
        isRead: { type: Boolean, default: false },
        link: { type: String, default: null },
    },
    { 
        timestamps: true 
    }
);

// Index for fast lookups by recipient
NotificationSchema.index({ recipientId: 1, role: 1, isRead: 1 });
