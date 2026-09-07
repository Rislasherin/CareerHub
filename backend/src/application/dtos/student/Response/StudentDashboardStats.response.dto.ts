export interface StudentDashboardStatsResponseDTO {
  studentId: string;
  stats: {
    applications: number;
    interviews: number;
    shortlisted: number;
    profileCompletion: number;
  };
  recommendedJobs: Array<{
    id: string;
    title: string;
    company: string;
    location: string;
    employmentType: string;
    skills: string[];
    matchPercentage: number;
    salary?: string;
    postedDate: Date | string;
  }>;
  recentApplications: Array<{
    id: string;
    jobId: string;
    jobTitle: string;
    company: string;
    status: string;
    appliedDate: Date | string;
  }>;
  aiPractice: {
    hasPracticed: boolean;
    latestScore?: number;
    weakestArea?: string;
    practicesCompleted: number;
    jobRole?: string;
  } | null;
  upcomingEvents: Array<{
    id: string;
    title: string;
    company: string;
    date: Date | string;
    type: 'INTERVIEW' | 'EVENT';
  }>;
  nextAction: {
    title: string;
    description: string;
    actionText: string;
    actionLink: string;
    type: 'PROFILE' | 'RESUME' | 'PRACTICE' | 'JOB' | 'INTERVIEW';
  } | null;
  resume: {
    hasResume: boolean;
    resumeName?: string;
    updatedAt?: Date | string;
    atsScore?: number;
  } | null;
}
