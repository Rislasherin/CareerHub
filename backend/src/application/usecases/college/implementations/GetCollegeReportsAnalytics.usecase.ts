import { IGetCollegeReportsAnalyticsUseCase } from "../interfaces/IGetCollegeReportsAnalytics.usecase";
import { ICollegeAnalyticsRepository, CollegeReportsAnalyticsDTO } from "@domain/repositories/ICollegeAnalyticsRepository";

export class GetCollegeReportsAnalyticsUseCase implements IGetCollegeReportsAnalyticsUseCase {
  constructor(private readonly collegeAnalyticsRepository: ICollegeAnalyticsRepository) {}

  async execute(collegeId: string, startDate?: Date, endDate?: Date): Promise<CollegeReportsAnalyticsDTO> {
    return await this.collegeAnalyticsRepository.getCollegePlacementAnalytics(collegeId, startDate, endDate);
  }
}
