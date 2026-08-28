import { Request, Response, NextFunction } from "express";
import { IGetCollegeReportsAnalyticsUseCase } from "@application/usecases/college/interfaces/IGetCollegeReportsAnalytics.usecase";
import { IGenerateCollegeReportUseCase, ExportFormat } from "@application/usecases/college/interfaces/IGenerateCollegeReport.usecase";

export class CollegeReportsController {
  constructor(
    private readonly getCollegeReportsAnalyticsUseCase: IGetCollegeReportsAnalyticsUseCase,
    private readonly generateCollegeReportUseCase: IGenerateCollegeReportUseCase
  ) {}

  async getAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.user?.orgId;
      if (!orgId) {
        res.status(401).json({ success: false, message: "Unauthorized: Invalid organization context." });
        return;
      }
      const { startDate, endDate } = req.query;
      let start: Date | undefined;
      let end: Date | undefined;
      
      if (startDate) {
        start = new Date(startDate as string);
      }
      if (endDate) {
        end = new Date(endDate as string);
      }

      const data = await this.getCollegeReportsAnalyticsUseCase.execute(orgId, start, end);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async exportAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.user?.orgId;
      if (!orgId) {
        res.status(401).json({ success: false, message: "Unauthorized: Invalid organization context." });
        return;
      }
      const { format, startDate, endDate } = req.query;
      
      if (!format || !['pdf', 'excel', 'csv'].includes(format as string)) {
        res.status(400).json({ success: false, message: "Invalid export format. Must be pdf, excel, or csv." });
        return;
      }

      let start: Date | undefined;
      let end: Date | undefined;
      
      if (startDate) {
        start = new Date(startDate as string);
      }
      if (endDate) {
        end = new Date(endDate as string);
      }

      const report = await this.generateCollegeReportUseCase.execute(orgId, format as ExportFormat, start, end);
      
      res.setHeader('Content-Type', report.mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${report.filename}"`);
      res.send(report.buffer);
    } catch (error) {
      next(error);
    }
  }
}
