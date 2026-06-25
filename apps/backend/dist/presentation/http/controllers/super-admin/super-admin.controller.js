"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuperAdminController = void 0;
const asyncHandler_util_1 = require("@shared/utils/asyncHandler.util");
const response_util_1 = require("@shared/utils/response.util");
class SuperAdminController {
    constructor(_getStatsUseCase, _getOrgsUseCase, _getStudentsUseCase, _getCompaniesUseCase, _getInterviewersUseCase, _updateStatusUseCase, _deleteUserUseCase, _updatePlanUseCase) {
        this._getStatsUseCase = _getStatsUseCase;
        this._getOrgsUseCase = _getOrgsUseCase;
        this._getStudentsUseCase = _getStudentsUseCase;
        this._getCompaniesUseCase = _getCompaniesUseCase;
        this._getInterviewersUseCase = _getInterviewersUseCase;
        this._updateStatusUseCase = _updateStatusUseCase;
        this._deleteUserUseCase = _deleteUserUseCase;
        this._updatePlanUseCase = _updatePlanUseCase;
        this.updateOrganizationPlan = (0, asyncHandler_util_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const { plan } = req.body;
            await this._updatePlanUseCase.execute(id, plan);
            (0, response_util_1.sendSuccess)(res, null, `Organization subscription plan updated to ${plan}`);
        });
        this.getStats = (0, asyncHandler_util_1.asyncHandler)(async (req, res) => {
            const stats = await this._getStatsUseCase.execute();
            (0, response_util_1.sendSuccess)(res, stats, "Dashboard stats retrieved successfully");
        });
        this.getOrganizations = (0, asyncHandler_util_1.asyncHandler)(async (req, res) => {
            const { query = "", page = 1, limit = 10 } = req.query;
            const result = await this._getOrgsUseCase.execute(query, Number(page), Number(limit));
            (0, response_util_1.sendSuccess)(res, result, "Organizations retrieved successfully");
        });
        this.getStudents = (0, asyncHandler_util_1.asyncHandler)(async (req, res) => {
            const { query = "", page = 1, limit = 10 } = req.query;
            const result = await this._getStudentsUseCase.execute(query, Number(page), Number(limit));
            (0, response_util_1.sendSuccess)(res, result, "Students retrieved successfully");
        });
        this.getCompanies = (0, asyncHandler_util_1.asyncHandler)(async (req, res) => {
            const { query = "", page = 1, limit = 10 } = req.query;
            const result = await this._getCompaniesUseCase.execute(query, Number(page), Number(limit));
            (0, response_util_1.sendSuccess)(res, result, "Companies retrieved successfully");
        });
        this.getInterviewers = (0, asyncHandler_util_1.asyncHandler)(async (req, res) => {
            const { query = "", page = 1, limit = 10 } = req.query;
            const result = await this._getInterviewersUseCase.execute(query, Number(page), Number(limit));
            (0, response_util_1.sendSuccess)(res, result, "Interviewers retrieved successfully");
        });
        this.updateStatus = (0, asyncHandler_util_1.asyncHandler)(async (req, res) => {
            const { role, id } = req.params;
            const { status } = req.body;
            const adminRole = req.user?.role;
            await this._updateStatusUseCase.execute(role, id, status, adminRole);
            (0, response_util_1.sendSuccess)(res, null, `User status updated to ${status}`);
        });
        this.deleteUser = (0, asyncHandler_util_1.asyncHandler)(async (req, res) => {
            const { role, id } = req.params;
            await this._deleteUserUseCase.execute(role, id);
            (0, response_util_1.sendSuccess)(res, null, "User deleted successfully");
        });
    }
}
exports.SuperAdminController = SuperAdminController;
