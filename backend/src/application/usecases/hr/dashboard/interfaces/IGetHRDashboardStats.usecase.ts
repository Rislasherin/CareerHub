

export interface IGetHRDashboardStatsUseCase {
  execute(companyId: string): Promise<any>;
}
