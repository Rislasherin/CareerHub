import { AIUsageRecord } from "@domain/entities/AIUsageRecord";
import { IBaseRepository } from "./IBaseRepository";

export interface IAIUsageRepository extends IBaseRepository<AIUsageRecord> {
  findByCollegeId(collegeId: string): Promise<AIUsageRecord[]>;
  getTotalCreditsConsumedByCollege(collegeId: string): Promise<number>;
  getUsageStatsByCollege(): Promise<{ collegeId: string; totalConsumed: number }[]>;
  findAll(filters?: any): Promise<{ data: AIUsageRecord[]; total: number; }>;
  save(entity: AIUsageRecord): Promise<void>;
}
