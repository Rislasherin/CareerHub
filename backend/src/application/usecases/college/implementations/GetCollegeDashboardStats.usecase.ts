import { IStudentRepository } from "@domain/repositories/IStudentRepository";
import { IJobRepository } from "@domain/repositories/IJobRepository";
import { IJobApplicationRepository } from "@domain/repositories/IJobApplicationRepository";
import { IGetPlacementReadinessUseCase } from "../interfaces/IGetPlacementReadiness.usecase";
import { ICompanyRepository } from "@domain/repositories/ICompanyRepository";
import { IGetCollegeDashboardStatsUseCase, CollegeDashboardStatsResponse } from "../interfaces/IGetCollegeDashboardStats.usecase";
import { JobStatus } from "@domain/enums/JobStatus.enum";

export class GetCollegeDashboardStatsUseCase implements IGetCollegeDashboardStatsUseCase {
  constructor(
    private readonly studentRepository: IStudentRepository,
    private readonly jobRepository: IJobRepository,
    private readonly jobApplicationRepository: IJobApplicationRepository,
    private readonly companyRepository: ICompanyRepository,
    private readonly placementReadinessUseCase: IGetPlacementReadinessUseCase
  ) { }

  async execute(orgId: string): Promise<CollegeDashboardStatsResponse> {
    // Execute multiple fetching operations concurrently
    const [
      totalStudents,
      activeJobs,
      appStats,
      placementReadiness
    ] = await Promise.all([
      this.studentRepository.count({ collegeId: orgId, isDeleted: { $ne: true } }),
      this.jobRepository.findByCollegeIdAndStatus(orgId, JobStatus.APPROVED),
      this.jobApplicationRepository.getCollegeApplicationStats(orgId),
      this.placementReadinessUseCase.execute(orgId)
    ]);

    // Top 5 Latest Jobs
    const topJobs = activeJobs.slice(0, 5);
    const latestJobs = await Promise.all(topJobs.map(async (job) => {
      const company = await this.companyRepository.findById(job.companyId);
      return {
        id: job.id!,
        title: job.title,
        companyName: company?.name || "Unknown Company",
        postedDate: job.createdAt!,
        applicationsCount: job.applicantCount || 0,
        status: job.status
      };
    }));

    // Calculate Engagement (Basic logic from Placement Readiness data)
    let profileCompleted = 0;
    let resumeCompleted = 0;
    
    if (placementReadiness.students.length > 0) {
      const totalInReadiness = placementReadiness.students.length;
      const profiles = placementReadiness.students.filter(s => s.factors.profile > 50).length; // Assume > 50 is completed
      const resumes = placementReadiness.students.filter(s => s.factors.resume !== null).length;
      
      profileCompleted = Math.round((profiles / totalInReadiness) * 100);
      resumeCompleted = Math.round((resumes / totalInReadiness) * 100);
    }

    // Top 5 students needing attention
    const studentsNeedingAttentionList = placementReadiness.students
      .filter(s => s.status === 'NEEDS_WORK' || s.status === 'AT_RISK')
      .sort((a, b) => a.readinessScore - b.readinessScore)
      .slice(0, 5);

    // Top 5 Skill Gaps
    const topSkillGaps = placementReadiness.skillGaps
      .sort((a, b) => b.studentsMissing - a.studentsMissing)
      .slice(0, 5);

    return {
      totalStudents,
      placementReady: placementReadiness.summary.ready,
      activeJobs: activeJobs.length,
      totalApplications: appStats.total,
      studentsNeedingAttention: placementReadiness.summary.needsWork + placementReadiness.summary.atRisk,
      studentsNeedingAttentionList,
      latestJobs,
      applicationActivity: {
        total: appStats.total,
        underReview: appStats.underReview,
        interviewStage: appStats.interviewStage,
        selected: appStats.selected,
        rejected: appStats.rejected
      },
      skillGaps: topSkillGaps,
      studentEngagement: {
        profileCompleted,
        resumeCompleted
      }
    };
  }
}

