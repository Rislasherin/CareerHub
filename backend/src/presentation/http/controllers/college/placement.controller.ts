import { Request, Response, NextFunction } from "express";
import { IGetCollegeInterviewsUseCase } from "@application/usecases/college/implementations/GetCollegeInterviews.usecase";
import { IGetCollegeOffersUseCase } from "@application/usecases/college/implementations/GetCollegeOffers.usecase";

export class CollegePlacementController {
  constructor(
    private readonly getCollegeInterviewsUseCase: IGetCollegeInterviewsUseCase,
    private readonly getCollegeOffersUseCase: IGetCollegeOffersUseCase
  ) {}

  async getInterviews(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const collegeId = req.user?.orgId;
      if (!collegeId) {
        res.status(401).json({ success: false, message: "Unauthorized: College ID missing" });
        return;
      }
      
      const interviews = await this.getCollegeInterviewsUseCase.execute(collegeId);
      res.status(200).json({ success: true, data: interviews });
    } catch (error) {
      next(error);
    }
  }

  async getOffers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const collegeId = req.user?.orgId;
      if (!collegeId) {
        res.status(401).json({ success: false, message: "Unauthorized: College ID missing" });
        return;
      }

      const offers = await this.getCollegeOffersUseCase.execute(collegeId);
      res.status(200).json({ success: true, data: offers });
    } catch (error) {
      next(error);
    }
  }
}
