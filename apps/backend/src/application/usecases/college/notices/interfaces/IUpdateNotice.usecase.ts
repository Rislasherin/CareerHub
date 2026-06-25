import { NoticeRequestDto } from "@application/dtos/college/Request/notice.request.dto";
import { Notice } from "@domain/entities/Notice";

export interface IUpdateNoticeUseCase {
    execute(collegeId:string,noticeId:string,dto:NoticeRequestDto): Promise<Notice>
}