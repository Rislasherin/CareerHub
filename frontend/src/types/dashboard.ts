export interface HRDashboardStats {
  stats: {
    totalCandidates: number;
    activeJobs: number;
    interviewsScheduled: number;
    offerLettersSent: number;
  };
  keyMetrics: {
    avgInterviewScore: number | null;
    shortlistRate: number | null;
    avgTimeToHire: number | null;
    offerAcceptance: number | null;
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

export interface CollegeDashboardStats {
  totalRegistered: number;
  pendingVerification: number;
  activeCompanies: number | null;
  activeDrives: number;
  recentActivity?: Array<{
    text: string;
    time: string;
  }>;
}

export interface CollegeReportsAnalytics {
  overview: {
    totalStudents: number;
    eligibleStudents: number | null;
    placedStudents: number | null;
    placementRate: number | null;
    offersReceived: number | null;
    offersAccepted: number | null;
  };
  placementTrend: Array<{
    label: string;
    value: number;
  }>;
  funnel: {
    eligible: number | null;
    applied: number | null;
    interviewed: number | null;
    offered: number | null;
    accepted: number | null;
  };
  interviews: {
    total: number;
    completed: number;
    upcoming: number;
    cancelled: number | null;
    completionRate: number | null;
  };
  offers: {
    total: number;
    accepted: number;
    pending: number | null;
    declined: number | null;
    acceptanceRate: number | null;
  };
  departmentAnalytics: Array<{ department: string; students: number; placed: number; placementRate: number }> | null;
  studentPlacementStatus: Array<{ status: string; count: number }> | null;
}

export interface SuperAdminDashboardStats {
  organizations: number;
  students: number;
  companies: number;
  mrr: number | null;
  aiCallsPerDay: number | null;
  renewalsDue: number | null;
  monthlyRevenue: number | null;
  planDistribution: Array<{ planType: string; count: number }> | null;
}
