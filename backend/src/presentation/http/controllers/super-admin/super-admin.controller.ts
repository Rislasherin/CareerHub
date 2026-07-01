import { Request, Response } from "express";
import { asyncHandler } from "@shared/utils/asyncHandler.util";
import { sendSuccess } from "@shared/utils/response.util";
import { IGetDashboardStatsUseCase } from "@application/usecases/super-admin/interfaces/IGetDashboardStatsUseCase.usecase";
import { IGetOrganizationsUseCase } from "@application/usecases/super-admin/interfaces/IGetOrganizationsUseCase.usecase";
import { IGetStudentsUseCase } from "@application/usecases/super-admin/interfaces/IGetStudentsUseCase.usecase";
import { IGetCompaniesUseCase } from "@application/usecases/super-admin/interfaces/IGetCompaniesUseCase.usecase";
import { IGetInterviewersUseCase } from "@application/usecases/super-admin/interfaces/IGetInterviewersUseCase.usecase";
import { IUpdateUserStatusUseCase } from "@application/usecases/super-admin/interfaces/IUpdateUserStatus.usecase";
import { IDeleteUserUseCase } from "@application/usecases/super-admin/interfaces/IDeleteUser.usecase";
import { IUpdateOrganizationPlanUseCase } from "@application/usecases/super-admin/interfaces/IUpdateOrganizationPlan.usecase";
import { MESSAGES } from "@shared/constants/messages.constants";

export class SuperAdminController {
  constructor(
    private readonly _getStatsUseCase: IGetDashboardStatsUseCase,
    private readonly _getOrgsUseCase: IGetOrganizationsUseCase,
    private readonly _getStudentsUseCase: IGetStudentsUseCase,
    private readonly _getCompaniesUseCase: IGetCompaniesUseCase,
    private readonly _getInterviewersUseCase: IGetInterviewersUseCase,
    private readonly _updateStatusUseCase: IUpdateUserStatusUseCase,
    private readonly _deleteUserUseCase: IDeleteUserUseCase,
    private readonly _updatePlanUseCase: IUpdateOrganizationPlanUseCase
  ) { }

  updateOrganizationPlan = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { plan } = req.body;
    await this._updatePlanUseCase.execute(id, plan);
    sendSuccess(res, null, `Organization subscription plan updated to ${plan}`);
  });

  getStats = asyncHandler(async (req: Request, res: Response) => {
    const stats = await this._getStatsUseCase.execute();
    sendSuccess(res, stats, MESSAGES.SUCCESS.FETCHED);
  });

  getOrganizations = asyncHandler(async (req: Request, res: Response) => {
    const { query = "", page = 1, limit = 10, status } = req.query;
    const result = await this._getOrgsUseCase.execute(query as string, Number(page), Number(limit), status as string);
    sendSuccess(res, result, MESSAGES.SUCCESS.FETCHED);
  });


  getStudents = asyncHandler(async (req: Request, res: Response) => {
    const { query = "", page = 1, limit = 10 } = req.query;
    const result = await this._getStudentsUseCase.execute(query as string, Number(page), Number(limit));
    sendSuccess(res, result, MESSAGES.SUCCESS.FETCHED);
  });

  getCompanies = asyncHandler(async (req: Request, res: Response) => {
    const { query = "", page = 1, limit = 10, status } = req.query;
    const result = await this._getCompaniesUseCase.execute(query as string, Number(page), Number(limit), status as string);
    sendSuccess(res, result, MESSAGES.SUCCESS.FETCHED);
  });

  getInterviewers = asyncHandler(async (req: Request, res: Response) => {
    const { query = "", page = 1, limit = 10 } = req.query;
    const result = await this._getInterviewersUseCase.execute(query as string, Number(page), Number(limit));
    sendSuccess(res, result, MESSAGES.SUCCESS.FETCHED);
  });

  updateStatus = asyncHandler(async (req: Request, res: Response) => {
    const { role, id } = req.params;
    const { status } = req.body;
    const adminRole = req.user?.role;
    await this._updateStatusUseCase.execute(role, id, status, adminRole);
    sendSuccess(res, null, `User status updated to ${status}`);
  });

  deleteUser = asyncHandler(async (req: Request, res: Response) => {
    const { role, id } = req.params;
    await this._deleteUserUseCase.execute(role, id);
    sendSuccess(res, null, MESSAGES.SUCCESS.DELETED);
  });


}
