import { Interview } from "../entities/Interview";
import { IBaseRepository } from "./IBaseRepository";

export interface IInterviewRepository extends IBaseRepository<Interview> {
  findByApplicationId(applicationId: string): Promise<Interview[]>;
  findByInterviewerId(interviewerId: string): Promise<Interview[]>;
  findByJobId(jobId: string): Promise<Interview[]>;
  findByCompanyId(companyId: string): Promise<Interview[]>;
  findByStudentId(studentId: string): Promise<Interview[]>;
}
