import { IJobRepository } from "@domain/repositories/IJobRepository";
import { IStudentRepository } from "@domain/repositories/IStudentRepository";
import { organizationRepository } from "@infrastructure/di/infra.container";

export interface CandidateListItem {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  collegeId: string;
  collegeName: string;
  degree: string;
  branch: string;
  graduationYear: number;
  cgpa: number;
  skills: string[];
  extraSkillsCount: number;
  matchScore: number;
  resumeScore: number;
  jobTitle: string;
  jobId: string;
  dateApplied: Date;
  hasApplied: boolean;
  status: string;
}

export interface IGetHRCandidatesUseCase {
  execute(companyId: string): Promise<CandidateListItem[]>;
}
