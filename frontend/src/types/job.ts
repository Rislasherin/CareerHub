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

export interface CandidateProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  collegeName: string;
  degree: string;
  branch: string;
  graduationYear: string;
  cgpa: number;
  skills: string[];
  resumeUrl?: string;
  experience?: {
    company: string;
    role: string;
    duration: string;
    location?: string;
    summary?: string;
  }[];
  projects?: {
    name: string;
    techStack?: string[];
    github?: string;
    liveDemo?: string;
    description?: string;
  }[];
  resumeScore?: number;
  preferences?: {
    preferredRole?: string;
    workMode?: string;
    location?: string;
    expectedCtc?: string;
    noticePeriod?: string;
    jobType?: string;
    startDate?: string;
  };
  softSkills?: string[];
  spokenLanguages?: {
    language: string;
    proficiency: string;
  }[];
  achievements?: {
    title: string;
    subtitle?: string;
    type?: 'award' | 'certification' | 'coding' | 'other';
  }[];
}

