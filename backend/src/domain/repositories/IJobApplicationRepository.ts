import { IBaseRepository } from "./IBaseRepository";
import { JobApplication } from "../entities/JobApplication";

export interface IJobApplicationRepository extends IBaseRepository<JobApplication> {
  findByJobId(jobId: string): Promise<JobApplication[]>;
  findByStudentId(studentId: string): Promise<JobApplication[]>;
  countByStudentIdSince(studentId: string, since: Date): Promise<number>;
  findByJobAndStudent(jobId: string, studentId: string): Promise<JobApplication | null>;
  getHRFunnelStats(companyId: string, startDate?: Date, endDate?: Date): Promise<{ label: string, value: number, color: string }[]>;
  getApplicationsThisWeek(companyId: string): Promise<number[]>;
  countUniqueCandidates(companyId: string): Promise<number>;
  
  // HR Analytics Additions
  countApplicationsInDateRange(companyId: string, startDate?: Date, endDate?: Date): Promise<number>;
  getApplicationsByMonth(companyId: string, startDate?: Date, endDate?: Date): Promise<{ month: string, count: number }[]>;
  getApplicationsByJobRole(companyId: string, startDate?: Date, endDate?: Date): Promise<{ role: string, count: number, percentage: number }[]>;
  getTopCollegesApplied(companyId: string, startDate?: Date, endDate?: Date): Promise<{ collegeName: string, applicationCount: number }[]>;
  
  getAverageTimeToHire(companyId: string, startDate?: Date, endDate?: Date): Promise<number | null>;
  getAverageCandidateScore(companyId: string, startDate?: Date, endDate?: Date): Promise<number | null>;
}
