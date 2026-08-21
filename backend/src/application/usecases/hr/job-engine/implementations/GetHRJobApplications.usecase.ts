import { IJobRepository } from "@domain/repositories/IJobRepository";
import { IJobApplicationRepository } from "@domain/repositories/IJobApplicationRepository";
import { IStudentRepository } from "@domain/repositories/IStudentRepository";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { IGetHRJobApplicationsUseCase } from "../interfaces/IGetHRJobApplications.usecase";

import { IInterviewRepository } from "@domain/repositories/IInterviewRepository";

export class GetHRJobApplicationsUseCase implements IGetHRJobApplicationsUseCase {
  constructor(
    private readonly _jobRepository: IJobRepository,
    private readonly _jobApplicationRepository: IJobApplicationRepository,
    private readonly _studentRepository: IStudentRepository,
    private readonly _interviewRepository: IInterviewRepository
  ) { }

  async execute(jobId: string, companyId: string, page: number = 1, limit: number = 10): Promise<{ applications: Record<string, unknown>[], total: number }> {
    const job = await this._jobRepository.findById(jobId);
    if (!job || job.companyId !== companyId) {
      throw new AppError("Job not found or unauthorized", HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }

    const applications = await this._jobApplicationRepository.findByJobId(jobId);

    const enrichedApplications = await Promise.all(
      applications.map(async (app) => {
        const appJson = app.toJSON();
        let studentDetails = null;

        if (appJson.studentId) {
          try {
            const student = await this._studentRepository.findById(appJson.studentId);
            if (student) {
              studentDetails = student.toJSON();
            }
          } catch (e) { }
        }

        let interviews: Record<string, unknown>[] = [];
        if (appJson.studentId && appJson.jobId) {
          try {
            const rawInterviews = await this._interviewRepository.findByStudentId(appJson.studentId);
            interviews = rawInterviews
              .filter(i => i.jobId === appJson.jobId)
              .map(i => {
                const props = i.toJSON();
                return {
                  id: props.id,
                  type: props.type,
                  status: props.status,
                  scheduledAt: props.scheduledAt
                };
              });
          } catch (e) { }
        }

        return {
          ...appJson,
          student: studentDetails,
          interviews
        };
      })
    );

    enrichedApplications.sort((a, b) => {
      const dateA = a.appliedAt ? new Date(a.appliedAt).getTime() : 0;
      const dateB = b.appliedAt ? new Date(b.appliedAt).getTime() : 0;
      return dateB - dateA;
    });

    const total = enrichedApplications.length;
    const startIndex = (page - 1) * limit;
    const paginatedApplications = enrichedApplications.slice(startIndex, startIndex + limit);

    return {
      applications: paginatedApplications,
      total
    };
  }
}
