export interface HRDashboardStats {
  stats: {
    totalCandidates: number;
    activeJobs: number;
    interviewsScheduled: number;
    offerLettersSent: number;
  };
  keyMetrics: {
    avgInterviewScore: string;
    shortlistRate: string;
    avgTimeToHire: string;
    offerAcceptance: string;
    activeInterviewers: number;
  };
  funnel: Array<{
    label: string;
    value: number;
    color: string;
  }>;
  recentActivity: Array<{
    title: string;
    time: string;
    icon: string;
    color: string;
    bg: string;
  }>;
  applicationsChart: number[];
}
