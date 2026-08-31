import { Request, Response } from "express";
import { asyncHandler } from "@shared/utils/asyncHandler.util";
import { sendSuccess } from "@shared/utils/response.util";
import { IGetDashboardStatsUseCase } from "@application/usecases/super-admin/interfaces/IGetDashboardStatsUseCase.usecase";
import { IGetOrganizationsUseCase } from "@application/usecases/super-admin/interfaces/IGetOrganizationsUseCase.usecase";
import { IGetStudentsUseCase } from "@application/usecases/super-admin/interfaces/IGetStudentsUseCase.usecase";
import { IGetCompaniesUseCase } from "@application/usecases/super-admin/interfaces/IGetCompaniesUseCase.usecase";

import { IUpdateUserStatusUseCase } from "@application/usecases/super-admin/interfaces/IUpdateUserStatus.usecase";
import { IDeleteUserUseCase } from "@application/usecases/super-admin/interfaces/IDeleteUser.usecase";
import { IUpdateOrganizationPlanUseCase } from "@application/usecases/super-admin/interfaces/IUpdateOrganizationPlan.usecase";
import { IExtendCollegeTrialUseCase } from "@application/usecases/super-admin/interfaces/IExtendCollegeTrial.usecase";
import { IGetBillingInvoicesUseCase } from "@application/usecases/super-admin/interfaces/IGetBillingInvoices.usecase";
import { ISendRenewalReminderUseCase } from "@application/usecases/super-admin/interfaces/ISendRenewalReminder.usecase";
import { IGetSuperAdminRevenueUseCase } from "@application/usecases/super-admin/interfaces/IGetSuperAdminRevenueUseCase.usecase";
import { IGetSuperAdminProfileUseCase } from "@application/usecases/super-admin/interfaces/IGetSuperAdminProfileUseCase.usecase";
import { IUpdateSuperAdminProfileUseCase } from "@application/usecases/super-admin/interfaces/IUpdateSuperAdminProfileUseCase.usecase";
import { IChangeSuperAdminPasswordUseCase } from "@application/usecases/super-admin/interfaces/IChangeSuperAdminPasswordUseCase.usecase";
import { IRequestSuperAdminEmailChangeUseCase } from "@application/usecases/super-admin/interfaces/IRequestSuperAdminEmailChangeUseCase.usecase";
import { IVerifySuperAdminEmailChangeUseCase } from "@application/usecases/super-admin/interfaces/IVerifySuperAdminEmailChangeUseCase.usecase";
import { ForbiddenError } from "@application/errors/AuthError";
import { ValidationError } from "@application/errors/validation.error";
import { Role } from "@domain/enums/Roles.enum";
import { MESSAGES } from "@shared/constants/messages.constants";

export class SuperAdminController {
  constructor(
    private readonly _getStatsUseCase: IGetDashboardStatsUseCase,
    private readonly _getOrgsUseCase: IGetOrganizationsUseCase,
    private readonly _getStudentsUseCase: IGetStudentsUseCase,
    private readonly _getCompaniesUseCase: IGetCompaniesUseCase,
    private readonly _updateStatusUseCase: IUpdateUserStatusUseCase,
    private readonly _deleteUserUseCase: IDeleteUserUseCase,
    private readonly _updatePlanUseCase: IUpdateOrganizationPlanUseCase,
    private readonly _extendTrialUseCase: IExtendCollegeTrialUseCase,
    private readonly _getBillingInvoicesUseCase: IGetBillingInvoicesUseCase,
    private readonly _sendRenewalReminderUseCase: ISendRenewalReminderUseCase,
    private readonly _getRevenueUseCase: IGetSuperAdminRevenueUseCase,
    private readonly _getProfileUseCase: IGetSuperAdminProfileUseCase,
    private readonly _updateProfileUseCase: IUpdateSuperAdminProfileUseCase,
    private readonly _changePasswordUseCase: IChangeSuperAdminPasswordUseCase,
    private readonly _requestEmailChangeUseCase: IRequestSuperAdminEmailChangeUseCase,
    private readonly _verifyEmailChangeUseCase: IVerifySuperAdminEmailChangeUseCase
  ) { }

  updateOrganizationPlan = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { plan } = req.body;
    await this._updatePlanUseCase.execute(id, plan);
    sendSuccess(res, null, MESSAGES.SUCCESS.UPDATED);
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



  updateStatus = asyncHandler(async (req: Request, res: Response) => {
    const { role, id } = req.params;
    const { status } = req.body;
    const adminRole = req.user?.role;
    await this._updateStatusUseCase.execute(role, id, status, adminRole);
    sendSuccess(res, null, MESSAGES.SUCCESS.UPDATED);
  });

  deleteUser = asyncHandler(async (req: Request, res: Response) => {
    const { role, id } = req.params;
    await this._deleteUserUseCase.execute(role, id);
    sendSuccess(res, null, MESSAGES.SUCCESS.DELETED);
  });

  extendTrial = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { days = 14 } = req.body;
    await this._extendTrialUseCase.execute(id, Number(days));
    sendSuccess(res, null, MESSAGES.SUCCESS.UPDATED);
  });

  getBillingInvoices = asyncHandler(async (req: Request, res: Response) => {
    if (req.user?.role !== Role.SUPER_ADMIN) {
      throw new ForbiddenError("Access denied: Super Admin authorization required");
    }
    const { page = "1", limit = "10", search, status, planType } = req.query;
    const filters = {
      search: search ? String(search) : undefined,
      status: status ? String(status) : undefined,
      planType: planType ? String(planType) : undefined
    };
    const result = await this._getBillingInvoicesUseCase.execute(
      parseInt(page as string), 
      parseInt(limit as string), 
      filters
    );
    sendSuccess(res, result, "Billing invoices fetched successfully");
  });

  sendRenewalReminder = asyncHandler(async (req: Request, res: Response) => {
    if (req.user?.role !== Role.SUPER_ADMIN) {
      throw new ForbiddenError("Access denied: Super Admin authorization required");
    }
    const { id } = req.params;
    if (!id) {
      throw new ValidationError("Subscription ID is required");
    }
    await this._sendRenewalReminderUseCase.execute(id);
    sendSuccess(res, null, "Renewal reminder sent successfully.");
  });

  getRevenueAnalytics = asyncHandler(async (req: Request, res: Response) => {
    if (req.user?.role !== Role.SUPER_ADMIN) {
      throw new ForbiddenError("Access denied: Super Admin authorization required");
    }
    const { page = "1", limit = "10", search, status, planType } = req.query;
    const filters = {
      search: search ? String(search) : undefined,
      status: status ? String(status) : undefined,
      planType: planType ? String(planType) : undefined
    };
    const result = await this._getRevenueUseCase.execute(
      parseInt(page as string), 
      parseInt(limit as string), 
      filters
    );
    sendSuccess(res, result, "Revenue analytics fetched successfully");
  });

  getProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const profile = await this._getProfileUseCase.execute(userId!);
    res.status(200).json({ success: true, data: profile });
  });

  updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const profile = await this._updateProfileUseCase.execute(userId!, req.body);
    res.status(200).json({ success: true, data: profile, message: "Profile updated successfully" });
  });

  changePassword = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    await this._changePasswordUseCase.execute(userId!, req.body);
    res.status(200).json({ success: true, message: "Password updated successfully" });
  });

  requestEmailChange = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    await this._requestEmailChangeUseCase.execute(userId!, req.body);
    res.status(200).json({ success: true, message: "Verification email sent" });
  });

  verifyEmailChange = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    await this._verifyEmailChangeUseCase.execute(userId!, req.body);
    res.status(200).json({ success: true, message: "Email updated successfully" });
  });
}
