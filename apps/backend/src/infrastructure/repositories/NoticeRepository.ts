import { INoticeRepository } from "@domain/repositories/INoticeRepository";
import { BaseRepository } from "./BaseRepository";
import { Notice } from "@domain/entities/Notice";
import { NoticeDocument, NoticeModel } from "@infrastructure/database/models/organizer/notice.model";
import { toNoticeEntity, toNoticePersistence } from "@application/mappers/notice.mapper";

export class NoticeRepository extends BaseRepository<Notice,NoticeDocument> implements INoticeRepository {
    constructor(){
        super(NoticeModel)
    }

    protected toEntity(doc: NoticeDocument): Notice {
        return toNoticeEntity(doc)
    }

    protected toPersistence(entity: Notice): Record<string, unknown> {
        return toNoticePersistence(entity)
    }

    async findByCollegeId(collegeId: string): Promise<Notice[]> {
        const docs = await this.model.find({ collegeId, isDeleted: { $ne: true } }).sort({createdAt:-1});
        return docs.map(doc => this.toEntity(doc as NoticeDocument));
    }
} 