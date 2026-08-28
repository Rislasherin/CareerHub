import { IGenerateCollegeReportUseCase, ExportFormat } from "../interfaces/IGenerateCollegeReport.usecase";
import { ICollegeAnalyticsRepository } from "@domain/repositories/ICollegeAnalyticsRepository";
import { ICollegeReportGenerator } from "@domain/services/ICollegeReportGenerator";
import { CompanyModel } from "@infrastructure/database/models/company/company.model";

export class GenerateCollegeReportUseCase implements IGenerateCollegeReportUseCase {
  constructor(
    private readonly collegeAnalyticsRepository: ICollegeAnalyticsRepository,
    private readonly pdfGenerator: ICollegeReportGenerator,
    private readonly excelGenerator: ICollegeReportGenerator,
    private readonly csvGenerator: ICollegeReportGenerator
  ) {}

  async execute(collegeId: string, format: ExportFormat, startDate?: Date, endDate?: Date): Promise<{ buffer: Buffer; mimeType: string; filename: string }> {
    // 1. Fetch raw placement data
    const analyticsData = await this.collegeAnalyticsRepository.getCollegePlacementAnalytics(collegeId, startDate, endDate);
    
    // 2. Try to fetch the college name for a better report header, fallback if missing
    let collegeName = 'College';
    try {
      const college = await CompanyModel.findById(collegeId).select('companyName').lean() as any;
      if (college && college.companyName) {
        collegeName = college.companyName;
      }
    } catch (e) {
      // Ignore
    }

    // 3. Route to the appropriate generator
    let buffer: Buffer;
    let mimeType: string;
    let extension: string;

    switch (format) {
      case 'pdf':
        buffer = await this.pdfGenerator.generate(analyticsData, collegeName);
        mimeType = 'application/pdf';
        extension = 'pdf';
        break;
      case 'excel':
        buffer = await this.excelGenerator.generate(analyticsData, collegeName);
        mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        extension = 'xlsx';
        break;
      case 'csv':
        buffer = await this.csvGenerator.generate(analyticsData, collegeName);
        mimeType = 'text/csv';
        extension = 'csv';
        break;
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }

    // Example filename: CareerHub_Placement_Report_2026-08-28.pdf
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `CareerHub_Placement_Report_${dateStr}.${extension}`;

    return { buffer, mimeType, filename };
  }
}
