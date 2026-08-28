export type ExportFormat = 'pdf' | 'excel' | 'csv';

export interface IGenerateCollegeReportUseCase {
  execute(collegeId: string, format: ExportFormat, startDate?: Date, endDate?: Date): Promise<{ buffer: Buffer; mimeType: string; filename: string }>;
}
