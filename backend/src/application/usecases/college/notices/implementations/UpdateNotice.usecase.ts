import { INoticeRepository } from "@domain/repositories/INoticeRepository";
import { IUpdateNoticeUseCase } from "../interfaces/IUpdateNotice.usecase";
import { NoticeRequestDto } from "@application/dtos/college/Request/notice.request.dto";
import { Notice } from "@domain/entities/Notice";

export class UpdateNoticeUseCase implements IUpdateNoticeUseCase {
    constructor(private readonly _noticeRepository:INoticeRepository){}

    async execute(collegeId: string, noticeId: string, dto: NoticeRequestDto): Promise<Notice> {
        const existingNotice = await this._noticeRepository.findById(noticeId)
        if(!existingNotice || existingNotice.collegeId !== collegeId ) {
            throw new Error("Notice not found or unauthorized");
        };

        const updatedNoticeData = Notice.create({
            ...existingNotice.toJSON(),
            title: dto.title,
            content: dto.content,
            priority: dto.priority
        });

        return await this._noticeRepository.update(noticeId, updatedNoticeData);
    }
}