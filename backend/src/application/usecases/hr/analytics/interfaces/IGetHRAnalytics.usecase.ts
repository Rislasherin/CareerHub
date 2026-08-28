export interface IGetHRAnalyticsUseCase {
  execute(
    companyId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<any>;
}
