
import { IJobApplicationRepository } from "@domain/repositories/IJobApplicationRepository";
import { IJobRepository } from "@domain/repositories/IJobRepository";
import { IInterviewRepository } from "@domain/repositories/IInterviewRepository";
import { IOfferRepository } from "@domain/repositories/IOfferRepository";
import { IGetHRDashboardStatsUseCase } from "../interfaces/IGetHRDashboardStats.usecase";
import { JobStatus } from "@domain/enums/JobStatus.enum";
import { InterviewStatus } from "@domain/enums/InterviewStatus.enum";

export class GetHRDashboardStatsUseCase implements IGetHRDashboardStatsUseCase {
  constructor(
    private readonly applicationRepository: IJobApplicationRepository,
    private readonly jobRepository: IJobRepository,
    private readonly interviewRepository: IInterviewRepository,
    private readonly offerRepository: IOfferRepository
  ) { }

  async execute(companyId: string): Promise<any> {
    const [
      totalCandidates,
      activeJobs,
      interviewsScheduled,
      offerLettersSent,
      funnel,
      applicationsChart
    ] = await Promise.all([
      this.applicationRepository.countUniqueCandidates(companyId),
      this.jobRepository.count({ companyId, status: JobStatus.ACTIVE }),
      this.interviewRepository.count({ companyId, status: InterviewStatus.SCHEDULED }),
      this.offerRepository.count({ companyId }),
      this.applicationRepository.getHRFunnelStats(companyId),
      this.applicationRepository.getApplicationsThisWeek(companyId)
    ]);

    return {
      stats: {
        totalCandidates,
        activeJobs,
        interviewsScheduled,
        offerLettersSent,
      },
      keyMetrics: {
        avgInterviewScore: null,
        shortlistRate: null,
        avgTimeToHire: null,
        offerAcceptance: null,
        activeInterviewers: 0,
      },
      funnel,
      recentActivity: [], // Empty dataset as per instruction if no reliable source exists
      applicationsChart
    };
  }
}

