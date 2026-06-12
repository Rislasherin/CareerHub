export interface InterviewRoundConfig {
  roundNumber: number;
  name: string;
  type: "aptitude" | "coding" | "technical" | "hr" | "group_discussion";
  description?: string;
}

export interface EligibilityCriteria {
  minCGPA: number;
  allowedBacklogs: number;
  eligibleBranches: string[];
  passingYear: number;
  degreeType: string;
}

export interface Job {
  id: string;
  companyId: string;
  collegeId: string;
  title: string;
  category: string;
  openings: number;
  deadline: string;
  type: string;
  eligibility: EligibilityCriteria;
  noticePeriod: string;
  experienceLevel: string;
  workMode: "on-site" | "remote" | "hybrid";
  location: string;
  salaryType: "per_month" | "per_year";
  minSalary: number;
  maxSalary: number;
  interviewMode: "online" | "offline" | "hybrid";
  description: string;
  requiredSkills: string[];
  preferredSkills?: string[];
  rounds: InterviewRoundConfig[];
  status: 'pending_review' | 'approved' | 'rejected' | 'active' | 'closed';
  rejectionNote?: string;
  approvedColleges?: string[];
  rejectedColleges?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface GetHRJobsResponse {
  jobs: Job[];
  total: number;
}
