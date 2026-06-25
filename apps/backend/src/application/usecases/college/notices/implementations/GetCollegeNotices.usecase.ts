import { INoticeRepository } from "@domain/repositories/INoticeRepository";
import { IGetCollegeNoticesUseCase } from "../interfaces/IGetCollegeNotices.usecase";
import { Notice } from "@domain/entities/Notice";

export class GetCollegeNoticeUseCase implements IGetCollegeNoticesUseCase {

    constructor(private readonly _noticeRepository:INoticeRepository){}

    async execute(collegeId: string): Promise<Notice[]> {
        return await this._noticeRepository.findByCollegeId(collegeId)
    }
}