import { CollegeReportsAnalyticsDTO } from "@domain/repositories/ICollegeAnalyticsRepository";

export interface ICollegeReportGenerator {
  generate(data: CollegeReportsAnalyticsDTO, collegeName?: string): Promise<Buffer>;
}
