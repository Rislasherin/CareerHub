import { Request, Response } from "express";
import { IGetHRAnalyticsUseCase } from "@application/usecases/hr/analytics/interfaces/IGetHRAnalytics.usecase";

export class HRAnalyticsController {
  constructor(private readonly getHRAnalyticsUseCase: IGetHRAnalyticsUseCase) {}

  getAnalytics = async (req: Request, res: Response): Promise<void> => {
    try {
      const companyId = req.user?.companyId;
      if (!companyId) {
        res.status(403).json({ success: false, message: "Unauthorized: Company context required" });
        return;
      }

      const { startDate, endDate } = req.query;
      let start: Date | undefined;
      let end: Date | undefined;

      if (startDate && typeof startDate === 'string') {
        start = new Date(startDate);
      }
      if (endDate && typeof endDate === 'string') {
        end = new Date(endDate);
      }

      const analytics = await this.getHRAnalyticsUseCase.execute(companyId, start, end);
      res.status(200).json({ success: true, data: analytics });
    } catch (error) {
      console.error("Error fetching HR analytics:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  };
}
