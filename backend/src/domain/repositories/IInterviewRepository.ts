import { Interview } from "@domain/entities/Interview";
import { IBaseRepository } from "./IBaseRepository";

export interface IInterviewRepository extends IBaseRepository<Interview> {
  save(interview: Interview): Promise<Interview>
  findByStudentId(studentId:string): Promise<Interview[]>
  findByJobId(jobId:string): Promise<Interview[]>
  findByCompanyId(companyId:string): Promise<Interview[]>;
}