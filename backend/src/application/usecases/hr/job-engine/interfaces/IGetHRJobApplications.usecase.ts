export interface IGetHRJobApplicationsUseCase {
  execute(jobId: string, companyId: string, page: number, limit: number): Promise<{ applications: Record<string, unknown>[], total: number }>;
}
