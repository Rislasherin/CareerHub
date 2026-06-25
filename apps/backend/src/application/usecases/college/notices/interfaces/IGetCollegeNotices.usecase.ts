import { Notice } from "@domain/entities/Notice";

export interface IGetCollegeNoticesUseCase {
    execute(collegeId:string):Promise<Notice[]>
}