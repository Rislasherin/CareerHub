export interface IGetHRHireRequestsUseCase {
    execute(companyId: string): Promise<any[]>;
}
