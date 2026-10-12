export interface IProcessScheduledJobsUseCase {
  execute(now?: Date): Promise<number>;
}
