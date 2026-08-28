import { IJobApplicationRepository } from "@domain/repositories/IJobApplicationRepository";
import { IJobRepository } from "@domain/repositories/IJobRepository";
import { IOfferRepository } from "@domain/repositories/IOfferRepository";
import { IGetHRAnalyticsUseCase } from "../interfaces/IGetHRAnalytics.usecase";

export class GetHRAnalyticsUseCase implements IGetHRAnalyticsUseCase {
  constructor(
    private readonly applicationRepository: IJobApplicationRepository,
    private readonly jobRepository: IJobRepository,
    private readonly offerRepository: IOfferRepository
  ) {}

  async execute(companyId: string, startDate?: Date, endDate?: Date): Promise<any> {
    const [
      totalApplications,
      applicationsByMonth,
      applicationsByJobRole,
      hiringFunnel,
      topColleges,
      skillDemand,
      offerOutcomes,
      averageTimeToHireDays,
      averageCandidateScore
    ] = await Promise.all([
      this.applicationRepository.countApplicationsInDateRange(companyId, startDate, endDate),
      this.applicationRepository.getApplicationsByMonth(companyId, startDate, endDate),
      this.applicationRepository.getApplicationsByJobRole(companyId, startDate, endDate),
      this.applicationRepository.getHRFunnelStats(companyId, startDate, endDate),
      this.applicationRepository.getTopCollegesApplied(companyId, startDate, endDate),
      this.jobRepository.getSkillDemand(companyId, startDate, endDate),
      this.offerRepository.getOfferOutcomes(companyId, startDate, endDate),
      this.applicationRepository.getAverageTimeToHire(companyId, startDate, endDate),
      this.applicationRepository.getAverageCandidateScore(companyId, startDate, endDate)
    ]);

    // Calculate Shortlist Rate (Shortlisted + Interviewing + Offered/Hired) / Total Applications
    let shortlistRate: number | null = null;
    if (totalApplications > 0) {
      const shortlistedCount = hiringFunnel
        .filter(f => f.label === 'Shortlisted' || f.label === 'Interviewing' || f.label === 'Offered/Hired')
        .reduce((sum, f) => sum + f.value, 0);
      shortlistRate = Math.round((shortlistedCount / totalApplications) * 100);
    }

    return {
      totalApplications,
      averageTimeToHireDays,
      shortlistRate,
      averageCandidateScore,
      applicationsByMonth,
      applicationsByJobRole,
      hiringFunnel,
      topColleges,
      skillDemand,
      interviewerActivity: null,
      timePerStage: null,
      offerOutcomes
    };
  }
}
