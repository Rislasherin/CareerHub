import { StudentReadiness, SkillGap } from "./IGetPlacementReadiness.usecase";

export interface DashboardJobDTO {
  id: string;
  title: string;
  companyName: string;
  postedDate: Date;
  applicationsCount: number;
  status: string;
}

export interface ApplicationActivityDTO {
  total: number;
  underReview: number;
  interviewStage: number;
  selected: number;
  rejected: number;
}

export interface StudentEngagementDTO {
  profileCompleted: number;
  resumeCompleted: number;
}

export interface CollegeDashboardStatsResponse {
  totalStudents: number;
  placementReady: number;
  activeJobs: number;
  totalApplications: number;
  studentsNeedingAttention: number;
  studentsNeedingAttentionList: StudentReadiness[];
  latestJobs: DashboardJobDTO[];
  applicationActivity: ApplicationActivityDTO;
  skillGaps: SkillGap[];
  studentEngagement: StudentEngagementDTO;
}

export interface IGetCollegeDashboardStatsUseCase {
  execute(orgId: string): Promise<CollegeDashboardStatsResponse>;
}
