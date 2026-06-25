import { INoticeRepository } from "@domain/repositories/INoticeRepository";
import { ICreateNoticeUseCase } from "../interfaces/ICreateNotice.usecase";
import { NoticeRequestDto } from "@application/dtos/college/Request/notice.request.dto";
import { Notice } from "@domain/entities/Notice";

export class CreateNoticeUseCase implements ICreateNoticeUseCase {
    constructor(
        private readonly _noticeRepository:INoticeRepository
    ){}

    async execute(collegeId: string, dto: NoticeRequestDto): Promise<Notice> {
        const newNotice = Notice.create({
            title: dto.title,
            content: dto.content,
            priority: dto.priority,
            collegeId: collegeId,
            isActive: true,
            createdAt: new Date()
        });
        return await this._noticeRepository.create(newNotice)
    }
}