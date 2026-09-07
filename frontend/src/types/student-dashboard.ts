export interface StudentDashboardStats {
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
    postedDate: string;
  }>;
  recentApplications: Array<{
    id: string;
    jobId: string;
    jobTitle: string;
    company: string;
    status: string;
    appliedDate: string;
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
    date: string;
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
    updatedAt?: string;
    atsScore?: number;
  } | null;
}
