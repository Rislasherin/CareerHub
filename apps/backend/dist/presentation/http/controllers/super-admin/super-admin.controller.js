"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuperAdminController = void 0;
const asyncHandler_util_1 = require("@shared/utils/asyncHandler.util");
const response_util_1 = require("@shared/utils/response.util");
class SuperAdminController {
    constructor(getStatsUseCase, getOrgsUseCase, getStudentsUseCase, getCompaniesUseCase, getInterviewersUseCase, updateStatusUseCase, deleteUserUseCase) {
        this.getStatsUseCase = getStatsUseCase;
        this.getOrgsUseCase = getOrgsUseCase;
        this.getStudentsUseCase = getStudentsUseCase;
        this.getCompaniesUseCase = getCompaniesUseCase;
        this.getInterviewersUseCase = getInterviewersUseCase;
        this.updateStatusUseCase = updateStatusUseCase;
        this.deleteUserUseCase = deleteUserUseCase;
        this.getStats = (0, asyncHandler_util_1.asyncHandler)(async (req, res) => {
            const stats = await this.getStatsUseCase.execute();
            (0, response_util_1.sendSuccess)(res, stats, "Dashboard stats retrieved successfully");
        });
        this.getOrganizations = (0, asyncHandler_util_1.asyncHandler)(async (req, res) => {
            const { query = "", page = 1, limit = 10 } = req.query;
            const result = await this.getOrgsUseCase.execute(query, Number(page), Number(limit));
            (0, response_util_1.sendSuccess)(res, result, "Organizations retrieved successfully");
        });
        this.getStudents = (0, asyncHandler_util_1.asyncHandler)(async (req, res) => {
            const { query = "", page = 1, limit = 10 } = req.query;
            const result = await this.getStudentsUseCase.execute(query, Number(page), Number(limit));
            (0, response_util_1.sendSuccess)(res, result, "Students retrieved successfully");
        });
        this.getCompanies = (0, asyncHandler_util_1.asyncHandler)(async (req, res) => {
            const { query = "", page = 1, limit = 10 } = req.query;
            const result = await this.getCompaniesUseCase.execute(query, Number(page), Number(limit));
            (0, response_util_1.sendSuccess)(res, result, "Companies retrieved successfully");
        });
        this.getInterviewers = (0, asyncHandler_util_1.asyncHandler)(async (req, res) => {
            const { query = "", page = 1, limit = 10 } = req.query;
            const result = await this.getInterviewersUseCase.execute(query, Number(page), Number(limit));
            (0, response_util_1.sendSuccess)(res, result, "Interviewers retrieved successfully");
        });
        this.updateStatus = (0, asyncHandler_util_1.asyncHandler)(async (req, res) => {
            const { role, id } = req.params;
            const { status } = req.body;
            await this.updateStatusUseCase.execute(role, id, status);
            (0, response_util_1.sendSuccess)(res, null, `User status updated to ${status}`);
        });
        this.deleteUser = (0, asyncHandler_util_1.asyncHandler)(async (req, res) => {
            const { role, id } = req.params;
            await this.deleteUserUseCase.execute(role, id);
            (0, response_util_1.sendSuccess)(res, null, "User deleted successfully");
        });
    }
}
exports.SuperAdminController = SuperAdminController;
