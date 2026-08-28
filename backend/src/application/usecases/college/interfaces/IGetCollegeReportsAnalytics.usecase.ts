import { CollegeReportsAnalyticsDTO } from "@domain/repositories/ICollegeAnalyticsRepository";

export interface IGetCollegeReportsAnalyticsUseCase {
  execute(collegeId: string, startDate?: Date, endDate?: Date): Promise<CollegeReportsAnalyticsDTO>;
}
