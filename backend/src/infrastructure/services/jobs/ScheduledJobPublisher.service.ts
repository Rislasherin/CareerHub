import { Logger } from "@infrastructure/logger/logger";
import { IProcessScheduledJobsUseCase } from "@application/usecases/hr/job-engine/interfaces/IProcessScheduledJobs.usecase";

export class ScheduledJobPublisherService {
  private _timer: NodeJS.Timeout | null = null;
  private _isRunning: boolean = false;

  constructor(private readonly _processScheduledJobsUseCase: IProcessScheduledJobsUseCase) {}

  public start(intervalMs: number = 30000): void {
    if (this._timer) {
      return;
    }

    Logger.info(`ScheduledJobPublisherService started with ${intervalMs}ms interval`);

    // Run once on startup to catch any jobs that matured during downtime
    this.pollJobs();

    this._timer = setInterval(() => {
      this.pollJobs();
    }, intervalMs);
  }

  public stop(): void {
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = null;
      Logger.info("ScheduledJobPublisherService stopped");
    }
  }

  private async pollJobs(): Promise<void> {
    if (this._isRunning) {
      return;
    }

    this._isRunning = true;
    try {
      const processedCount = await this._processScheduledJobsUseCase.execute();
      if (processedCount > 0) {
        Logger.info(`ScheduledJobPublisherService successfully published ${processedCount} scheduled job(s)`);
      }
    } catch (error: any) {
      Logger.error("ScheduledJobPublisherService poll error", { error: error?.message || error });
    } finally {
      this._isRunning = false;
    }
  }
}
