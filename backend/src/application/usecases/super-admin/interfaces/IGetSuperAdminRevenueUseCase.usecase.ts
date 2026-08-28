export interface IGetSuperAdminRevenueUseCase {
  execute(page: number, limit: number, filters?: { search?: string, status?: string, planType?: string }): Promise<any>;
}
