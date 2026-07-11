import { IJobRepository } from "@domain/repositories/IJobRepository";
import { IJobApplicationRepository } from "@domain/repositories/IJobApplicationRepository";
import { IStudentRepository } from "@domain/repositories/IStudentRepository";

export class GetHRHireRequestsUseCase {
  constructor(
    private readonly _jobRepository: IJobRepository,
    private readonly _jobApplicationRepository: IJobApplicationRepository,
    private readonly _studentRepository: IStudentRepository
  ) { }

  async execute(companyId: string, page: number = 1, limit: number = 10): Promise<{ applications: Record<string, unknown>[], total: number }> {
    // 1. Get all jobs for company
    const jobs = await this._jobRepository.findByCompanyId(companyId);
    if (!jobs.length) return { applications: [], total: 0 };

    const jobIds = jobs.map(j => j.id!);

    // 2. Fetch applications with status SELECTED
    const allSelectedApps = [];
    for (const jobId of jobIds) {
      const apps = await this._jobApplicationRepository.findByJobId(jobId);
      allSelectedApps.push(...apps.filter(app => app.status === 'SELECTED'));
    }

    // 3. Map with student details and job title
    const results = await Promise.all(
      allSelectedApps.map(async (app) => {
        const appJson = app.toJSON();
        let studentDetails = null;
        if (appJson.studentId) {
          try {
            const student = await this._studentRepository.findById(appJson.studentId);
            if (student) studentDetails = student.toJSON();
          } catch (e) { }
        }

        const job = jobs.find(j => j.id === appJson.jobId);

        return {
          ...appJson,
          student: studentDetails,
          job: job ? job.toJSON() : null
        };
      })
    );

    const total = results.length;
    const startIndex = (page - 1) * limit;
    const paginatedResults = results.slice(startIndex, startIndex + limit);

    return {
      applications: paginatedResults,
      total
    };
  }
}
