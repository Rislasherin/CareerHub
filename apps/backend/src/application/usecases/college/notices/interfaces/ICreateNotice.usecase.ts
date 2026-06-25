import { NoticeRequestDto } from "@application/dtos/college/Request/notice.request.dto";
import { Notice } from "@domain/entities/Notice";

export interface ICreateNoticeUseCase {
    execute(collegeId:string,dto:NoticeRequestDto): Promise<Notice>
}