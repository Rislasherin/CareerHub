export interface IGetAILedgerUseCase {
  execute(filters?: { collegeId?: string, feature?: string, startDate?: Date, endDate?: Date }): Promise<any[]>;
  getAggregatedStats(): Promise<any>;
}
