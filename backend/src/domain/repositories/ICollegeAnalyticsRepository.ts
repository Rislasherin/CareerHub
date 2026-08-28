export interface CollegeReportsAnalyticsDTO {
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

export interface ICollegeAnalyticsRepository {
  getCollegePlacementAnalytics(collegeId: string, startDate?: Date, endDate?: Date): Promise<CollegeReportsAnalyticsDTO>;
}
