
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
        avgInterviewScore: '8.4/10',
        shortlistRate: '68%',
        avgTimeToHire: '12 Days',
        offerAcceptance: '94%',
        activeInterviewers: 5,
      },
      funnel,
      recentActivity: [
        { title: 'New candidate applied for Frontend Developer', time: '2 hours ago', icon: 'UserCheck', bg: 'bg-indigo-50', color: 'text-indigo-600' },
        { title: 'Technical Interview completed', time: '5 hours ago', icon: 'CheckCircle2', bg: 'bg-emerald-50', color: 'text-emerald-600' },
        { title: 'Offer letter sent to John Doe', time: '1 day ago', icon: 'FileText', bg: 'bg-blue-50', color: 'text-blue-600' },
        { title: 'New job posting: Backend Engineer', time: '2 days ago', icon: 'Briefcase', bg: 'bg-amber-50', color: 'text-amber-600' }
      ],
      applicationsChart
    };
  }
}

