import { IInterviewerRepository } from "@domain/repositories/IInterviewerRepository";

export interface IGetHRDashboardStatsUseCase {
  execute(companyId: string): Promise<any>;
}
