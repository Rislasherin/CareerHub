export interface IGetHROffersUseCase {
    execute(companyId: string): Promise<Record<string, unknown>[]>;
}
