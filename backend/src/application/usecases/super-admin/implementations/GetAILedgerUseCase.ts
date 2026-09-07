import { IAIUsageRepository } from "@domain/repositories/IAIUsageRepository";
import { IGetAILedgerUseCase } from "../interfaces/IGetAILedgerUseCase";
import { AIUsageRecord } from "@domain/entities/AIUsageRecord";

export class GetAILedgerUseCase implements IGetAILedgerUseCase {
  constructor(private readonly aiUsageRepo: IAIUsageRepository) {}

  async execute(filters?: { collegeId?: string, feature?: string, startDate?: Date, endDate?: Date }): Promise<any[]> {
    let records: AIUsageRecord[] = [];
    
    if (filters?.collegeId) {
       records = await this.aiUsageRepo.findByCollegeId(filters.collegeId);
    } else {
       const result = await (this.aiUsageRepo as any).findAll(filters);
       records = result.data;
    }

    return records.map(r => r.toJSON());
  }

  async getAggregatedStats(): Promise<any> {
     return await this.aiUsageRepo.getUsageStatsByCollege();
  }
}
