import { logger } from "@infrastructure/logger/logger";
import { IJobApplicationRepository } from "@domain/repositories/IJobApplicationRepository";
import { IJobRepository } from "@domain/repositories/IJobRepository";
import { ICompanyRepository } from "@domain/repositories/ICompanyRepository";
import { IGetStudentApplicationsUseCase } from "../interfaces/IGetStudentApplications.usecase";
import { IInterviewRepository } from "@domain/repositories/IInterviewRepository";
import { JobApplicationStatus } from "@domain/enums/JobApplicationStatus.enum";

export class GetStudentApplicationsUseCase implements IGetStudentApplicationsUseCase {
  constructor(
    private readonly _jobApplicationRepository: IJobApplicationRepository,
    private readonly _jobRepository: IJobRepository,
    private readonly _companyRepository: ICompanyRepository,
    private readonly _interviewRepository: IInterviewRepository
  ) { }

  async execute(studentId: string): Promise<Record<string, unknown>[]> {
    const applications = await this._jobApplicationRepository.findByStudentId(studentId);

    const companyCache = new Map<string, string>();
    const jobCache = new Map<string, Record<string, unknown>>();

    const enrichedApplications = await Promise.all(applications.map(async (app) => {
      const appJson = app.toJSON();

      let jobDetails = null;
      if (appJson.jobId) {
        if (jobCache.has(appJson.jobId)) {
          jobDetails = jobCache.get(appJson.jobId);
        } else {
          try {
            const job = await this._jobRepository.findById(appJson.jobId);
            if (job) {
              const jobJson = job.toJSON();
              let companyName = "Company";
              if (jobJson.companyId) {
                if (companyCache.has(jobJson.companyId)) {
                  companyName = companyCache.get(jobJson.companyId)!;
                } else {
                  const company = await this._companyRepository.findById(jobJson.companyId);
                  if (company) {
                    companyName = company.name;
                    companyCache.set(jobJson.companyId, company.name);
                  }
                }
              }
              jobDetails = {
                ...jobJson,
                companyName
              };
              jobCache.set(appJson.jobId, jobDetails);
            }
          } catch (e) { }
        }
      }

      let interviewData = null;
      if (appJson.status === JobApplicationStatus.INTERVIEWING) {
        try {
          const interviews = await this._interviewRepository.findByApplicationId(appJson.id!);
          if (interviews && interviews.length > 0) {
            // Get the most recent interview
            const latestInterview = interviews[interviews.length - 1];
            interviewData = {
              title: latestInterview.title,
              scheduledAt: latestInterview.scheduledAt,
              meetingLink: latestInterview.meetingLink
            };
          }
        } catch (e) {
          logger.error("Error fetching interview for student app", e);
        }
      }

      return {
        ...appJson,
        job: jobDetails,
        interview: interviewData
      };
    }));

    // Sort by appliedAt descending
    enrichedApplications.sort((a, b) => {
      const dateA = a.appliedAt ? new Date(a.appliedAt).getTime() : 0;
      const dateB = b.appliedAt ? new Date(b.appliedAt).getTime() : 0;
      return dateB - dateA;
    });

    return enrichedApplications;
  }
}
