export interface IDeleteNoticeUseCase {
    execute(collegeId:string,noticeId:string): Promise<void>
}