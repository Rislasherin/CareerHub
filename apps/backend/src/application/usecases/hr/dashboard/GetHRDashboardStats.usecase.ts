import { IInterviewerRepository } from "@domain/repositories/IInterviewerRepository";

export interface IGetHRDashboardStatsUseCase {
  execute(companyId: string): Promise<any>;
}

export class GetHRDashboardStatsUseCase implements IGetHRDashboardStatsUseCase {
  constructor(private readonly _interviewerRepository: IInterviewerRepository) { }

  async execute(companyId: string): Promise<any> {
    // Retrieve actual active interviewer count from the database
    const { total: activeInterviewers } = await this._interviewerRepository.searchInterviewers(companyId, "", 1, 1);

    return {
      stats: {
        totalCandidates: 24,       // Placeholder until Application Schema is created
        activeJobs: 4,             // Placeholder until Job Schema is created
        interviewsScheduled: 8,    // Placeholder
        offerLettersSent: 3,       // Placeholder
      },
      keyMetrics: {
        avgInterviewScore: "4.1/5",
        shortlistRate: "25%",
        avgTimeToHire: "11 days",
        offerAcceptance: "100%",
        activeInterviewers: activeInterviewers, // Live count from Mongoose!
      },
      funnel: [
        { label: "Applied", value: 24, color: "bg-indigo-600" },
        { label: "Reviewed", value: 16, color: "bg-indigo-400" },
        { label: "Shortlisted", value: 8, color: "bg-amber-400" },
        { label: "Interviewed", value: 4, color: "bg-emerald-500" },
      ],
      recentActivity: [
        { title: "Antypea Sharma shortlisted for Software Engineer", time: "2 hours ago", icon: "CheckCircle2", color: "text-emerald-500", bg: "bg-emerald-50" },
        { title: "Interview invite sent to Rohit Mehra", time: "4 hours ago", icon: "MessageSquare", color: "text-blue-500", bg: "bg-blue-50" },
        { title: "8 new AI-matched candidates for Data Analyst", time: "Yesterday, 6:30 PM", icon: "Zap", color: "text-amber-500", bg: "bg-amber-50" },
        { title: "Company profile viewed by IIT Bombay Placements", time: "Yesterday, 2:10 PM", icon: "Building2", color: "text-slate-500", bg: "bg-slate-50" },
      ],
      applicationsChart: [8, 12, 6, 15, 10, 4, 2] // MON to SUN applicants count
    };
  }
}
