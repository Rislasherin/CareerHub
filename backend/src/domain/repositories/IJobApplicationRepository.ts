import { IBaseRepository } from "./IBaseRepository";
import { JobApplication } from "../entities/JobApplication";

export interface IJobApplicationRepository extends IBaseRepository<JobApplication> {
  findByJobId(jobId: string): Promise<JobApplication[]>;
  findByStudentId(studentId: string): Promise<JobApplication[]>;
  countByStudentIdSince(studentId: string, since: Date): Promise<number>;
  findByJobAndStudent(jobId: string, studentId: string): Promise<JobApplication | null>;
}
