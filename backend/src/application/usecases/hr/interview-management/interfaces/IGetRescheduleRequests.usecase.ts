export interface IGetRescheduleRequestsUseCase {
    execute(companyId: string): Promise<any[]>;
}
