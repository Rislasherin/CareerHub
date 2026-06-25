import { INoticeRepository } from "@domain/repositories/INoticeRepository";
import { IDeleteNoticeUseCase } from "../interfaces/IDeleteNotice.usecase";

export class DeleteNoticeUseCase implements IDeleteNoticeUseCase {
    constructor(private readonly _noticeRepository:INoticeRepository){}


    async execute(collegeId: string, noticeId: string): Promise<void> {
        const notice = await this._noticeRepository.findById(noticeId);
        if(!notice || notice.collegeId !== collegeId){
            throw new Error("Notice not found or unauthorized");
        }

        await this._noticeRepository.delete(noticeId)
    }
}