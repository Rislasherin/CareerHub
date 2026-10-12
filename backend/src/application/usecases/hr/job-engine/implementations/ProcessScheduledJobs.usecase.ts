import { JobStatus } from "@domain/enums/JobStatus.enum";
import { IJobRepository } from "@domain/repositories/IJobRepository";
import { IProcessScheduledJobsUseCase } from "../interfaces/IProcessScheduledJobs.usecase";

export class ProcessScheduledJobsUseCase implements IProcessScheduledJobsUseCase {
  constructor(private readonly _jobRepository: IJobRepository) {}

  async execute(now: Date = new Date()): Promise<number> {
    const dueJobs = await this._jobRepository.findDueScheduledJobs(now);
    let processedCount = 0;

    for (const job of dueJobs) {
      if (job.isDeleted || !job.id) {
        continue;
      }

      // Concurrency-safe atomic transition:
      // only succeeds if status is still SCHEDULED in the database.
      const targetStatus = JobStatus.PENDING_REVIEW;
      const claimed = await this._jobRepository.claimAndPublishScheduledJob(job.id, targetStatus);
      if (claimed) {
        processedCount++;
      }
    }

    return processedCount;
  }
}
