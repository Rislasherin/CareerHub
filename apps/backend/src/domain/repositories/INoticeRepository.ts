import { IBaseRepository } from "./IBaseRepository";
import { Notice } from "@domain/entities/Notice";

export interface INoticeRepository extends IBaseRepository<Notice> {
    findByCollegeId(collegeId:string):Promise<Notice[]>;


}