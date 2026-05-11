import { Request, Response } from "express";
import { asyncHandler } from "@shared/utils/asyncHandler.util";
import { sendSuccess } from "@shared/utils/response.util";
import { IGetDashboardStatsUseCase } from "@application/usecases/super-admin/GetDashboardStats.usecase";
import { IGetOrganizationsUseCase } from "@application/usecases/super-admin/GetOrganizations.usecase";
import { IGetStudentsUseCase } from "@application/usecases/super-admin/GetStudents.usecase";
import { IGetCompaniesUseCase } from "@application/usecases/super-admin/GetCompanies.usecase";
import { IGetInterviewersUseCase } from "@application/usecases/super-admin/GetInterviewers.usecase";

export class SuperAdminController {
  constructor(
    private readonly getStatsUseCase: IGetDashboardStatsUseCase,
    private readonly getOrgsUseCase: IGetOrganizationsUseCase,
    private readonly getStudentsUseCase: IGetStudentsUseCase,
    private readonly getCompaniesUseCase: IGetCompaniesUseCase,
    private readonly getInterviewersUseCase: IGetInterviewersUseCase
  ) {}

  getStats = asyncHandler(async (req: Request, res: Response) => {
    const stats = await this.getStatsUseCase.execute();
    sendSuccess(res, stats, "Dashboard stats retrieved successfully");
  });

  getOrganizations = asyncHandler(async (req: Request, res: Response) => {
    const { query = "", page = 1, limit = 10 } = req.query;
    const result = await this.getOrgsUseCase.execute(query as string, Number(page), Number(limit));
    sendSuccess(res, result, "Organizations retrieved successfully");
  });

  getStudents = asyncHandler(async (req: Request, res: Response) => {
    const { query = "", page = 1, limit = 10 } = req.query;
    const result = await this.getStudentsUseCase.execute(query as string, Number(page), Number(limit));
    sendSuccess(res, result, "Students retrieved successfully");
  });

  getCompanies = asyncHandler(async (req: Request, res: Response) => {
    const { query = "", page = 1, limit = 10 } = req.query;
    const result = await this.getCompaniesUseCase.execute(query as string, Number(page), Number(limit));
    sendSuccess(res, result, "Companies retrieved successfully");
  });

  getInterviewers = asyncHandler(async (req: Request, res: Response) => {
    const { query = "", page = 1, limit = 10 } = req.query;
    const result = await this.getInterviewersUseCase.execute(query as string, Number(page), Number(limit));
    sendSuccess(res, result, "Interviewers retrieved successfully");
  });
}
