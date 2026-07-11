export interface IGetHRHireRequestsUseCase {
    execute(companyId: string, page: number, limit: number): Promise<{ applications: Record<string, unknown>[], total: number }>;
}
