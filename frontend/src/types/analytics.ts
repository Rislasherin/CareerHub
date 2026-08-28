export interface CompanyAnalytics {
  totalApplications: number;
  averageTimeToHireDays: number | null;
  shortlistRate: number | null;
  averageCandidateScore: number | null;
  applicationsByMonth: Array<{
    month: string;
    count: number;
  }>;
  applicationsByJobRole: Array<{
    role: string;
    count: number;
    percentage: number;
  }>;
  hiringFunnel: Array<{
    label: string;
    value: number;
    color: string;
  }>;
  topColleges: Array<{
    collegeName: string;
    applicationCount: number;
  }>;
  skillDemand: Array<{
    skill: string;
    demand: number;
  }>;
  interviewerActivity: Array<{
    interviewerId: string;
    interviewerName: string;
    roundsCompleted: number;
    averageScore: number | null;
    feedbackPending: number;
  }> | null;
  timePerStage: Array<{
    stage: string;
    averageDays: number | null;
  }> | null;
  offerOutcomes: {
    accepted: number;
    pending: number;
    declined: number;
  };
}
