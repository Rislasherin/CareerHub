import { Model } from "mongoose";
import { Notification } from "@domain/entities/Notification";
import { INotificationRepository } from "@domain/repositories/INotificationRepository";
import { NotificationRole } from "@domain/enums/NotificationRole.enum";
import { INotificationDocument } from "../database/models/common/notification.model";
import { NotificationMapper } from "@application/mappers/notification.mapper";

export class NotificationRepository implements INotificationRepository {
    constructor(private readonly model: Model<INotificationDocument>) {}

    async count(filter: Record<string, unknown>): Promise<number> {
        return await this.model.countDocuments(filter).exec();
    }

    async create(entity: Notification): Promise<Notification> {
        const created = await this.model.create({
            recipientId: entity.recipientId,
            role: entity.role,
            title: entity.title,
            message: entity.message,
            type: entity.type,
            isRead: entity.isRead,
            link: entity.link
        });
        return NotificationMapper.toDomain(created);
    }

    async findById(id: string): Promise<Notification | null> {
        const doc = await this.model.findById(id).exec();
        return doc ? NotificationMapper.toDomain(doc) : null;
    }

    async findAll(): Promise<Notification[]> {
        const docs = await this.model.find().exec();
        return docs.map((doc) => NotificationMapper.toDomain(doc));
    }

    async update(id: string, entity: Notification): Promise<Notification> {
        const updated = await this.model.findByIdAndUpdate(id, {
            title: entity.title,
            message: entity.message,
            isRead: entity.isRead,
            link: entity.link
        }, { new: true }).exec();
        
        if (!updated) {
            throw new Error("Notification not found");
        }
        return NotificationMapper.toDomain(updated);
    }

    async delete(id: string): Promise<void> {
        await this.model.findByIdAndDelete(id).exec();
    }

    async findByRecipient(recipientId: string, role: NotificationRole): Promise<Notification[]> {
        const docs = await this.model.find({ recipientId, role }).sort({ createdAt: -1 }).exec();
        return docs.map((doc) => NotificationMapper.toDomain(doc));
    }

    async markAsRead(notificationId: string): Promise<Notification | null> {
        const updated = await this.model.findByIdAndUpdate(
            notificationId,
            { isRead: true },
            { new: true }
        ).exec();
        return updated ? NotificationMapper.toDomain(updated) : null;
    }

    async markAllAsRead(recipientId: string, role: NotificationRole): Promise<void> {
        await this.model.updateMany(
            { recipientId, role, isRead: false },
            { isRead: true }
        ).exec();
    }

    async countUnread(recipientId: string, role: NotificationRole): Promise<number> {
        return await this.model.countDocuments({ recipientId, role, isRead: false }).exec();
    }
}
