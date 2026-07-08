export interface IGetHRJobApplicationsUseCase {
  execute(jobId: string, companyId: string): Promise<any[]>;
}
