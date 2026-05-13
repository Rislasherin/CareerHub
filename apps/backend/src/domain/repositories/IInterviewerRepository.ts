import { Interviewer } from "@domain/entities/Interviewer";
import { IBaseRepository } from "./IBaseRepository";

export interface IInterviewerRepository extends IBaseRepository<Interviewer> {
  findByEmail(email: string): Promise<Interviewer | null>;
  findByCompanyId(companyId: string): Promise<Interviewer[]>;
  searchInterviewers(companyId: string, query: string, page: number, limit: number): Promise<{ interviewers: Interviewer[], total: number }>;
  searchAllInterviewers(query: string, page: number, limit: number): Promise<{ interviewers: Interviewer[], total: number }>;
  updateStatus(id: string, status: string, blockedBy?: string): Promise<void>;
}
