import { Request, Response } from "express";
import { asyncHandler } from "@shared/utils/asyncHandler.util";
import { sendSuccess } from "@shared/utils/response.util";
import { IGetDashboardStatsUseCase } from "@application/usecases/super-admin/GetDashboardStats.usecase";
import { IGetOrganizationsUseCase } from "@application/usecases/super-admin/GetOrganizations.usecase";
import { IGetStudentsUseCase } from "@application/usecases/super-admin/GetStudents.usecase";
import { IGetCompaniesUseCase } from "@application/usecases/super-admin/GetCompanies.usecase";
import { IGetInterviewersUseCase } from "@application/usecases/super-admin/GetInterviewers.usecase";
import { UpdateUserStatusUseCase } from "@application/usecases/super-admin/UpdateUserStatus.usecase";
import { DeleteUserUseCase } from "@application/usecases/super-admin/DeleteUser.usecase";
import { UpdateOrganizationPlanUseCase } from "@application/usecases/super-admin/UpdateOrganizationPlan.usecase";

export class SuperAdminController {
  constructor(
    private readonly _getStatsUseCase: IGetDashboardStatsUseCase,
    private readonly _getOrgsUseCase: IGetOrganizationsUseCase,
    private readonly _getStudentsUseCase: IGetStudentsUseCase,
    private readonly _getCompaniesUseCase: IGetCompaniesUseCase,
    private readonly _getInterviewersUseCase: IGetInterviewersUseCase,
    private readonly _updateStatusUseCase: UpdateUserStatusUseCase,
    private readonly _deleteUserUseCase: DeleteUserUseCase,
    private readonly _updatePlanUseCase: UpdateOrganizationPlanUseCase
  ) { }

  updateOrganizationPlan = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { plan } = req.body;
    await this._updatePlanUseCase.execute(id, plan);
    sendSuccess(res, null, `Organization subscription plan updated to ${plan}`);
  });

  getStats = asyncHandler(async (req: Request, res: Response) => {
    const stats = await this._getStatsUseCase.execute();
    sendSuccess(res, stats, "Dashboard stats retrieved successfully");
  });

  getOrganizations = asyncHandler(async (req: Request, res: Response) => {
    const { query = "", page = 1, limit = 10 } = req.query;
    const result = await this._getOrgsUseCase.execute(query as string, Number(page), Number(limit));
    sendSuccess(res, result, "Organizations retrieved successfully");
  });

  getStudents = asyncHandler(async (req: Request, res: Response) => {
    const { query = "", page = 1, limit = 10 } = req.query;
    const result = await this._getStudentsUseCase.execute(query as string, Number(page), Number(limit));
    sendSuccess(res, result, "Students retrieved successfully");
  });

  getCompanies = asyncHandler(async (req: Request, res: Response) => {
    const { query = "", page = 1, limit = 10 } = req.query;
    const result = await this._getCompaniesUseCase.execute(query as string, Number(page), Number(limit));
    sendSuccess(res, result, "Companies retrieved successfully");
  });

  getInterviewers = asyncHandler(async (req: Request, res: Response) => {
    const { query = "", page = 1, limit = 10 } = req.query;
    const result = await this._getInterviewersUseCase.execute(query as string, Number(page), Number(limit));
    sendSuccess(res, result, "Interviewers retrieved successfully");
  });

  updateStatus = asyncHandler(async (req: any, res: Response) => {
    const { role, id } = req.params;
    const { status } = req.body;
    const adminRole = req.user?.role;
    await this._updateStatusUseCase.execute(role, id, status, adminRole);
    sendSuccess(res, null, `User status updated to ${status}`);
  });

  deleteUser = asyncHandler(async (req: Request, res: Response) => {
    const { role, id } = req.params;
    await this._deleteUserUseCase.execute(role, id);
    sendSuccess(res, null, "User deleted successfully");
  });
}
