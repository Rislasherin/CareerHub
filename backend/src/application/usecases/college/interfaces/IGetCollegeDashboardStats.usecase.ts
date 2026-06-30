import { IStudentRepository } from "@domain/repositories/IStudentRepository";
import { UserStatus } from "@domain/enums/user.status.enum";

export interface IGetCollegeDashboardStatsUseCase {
  execute(orgId: string): Promise<any>;
}
