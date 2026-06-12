"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HRDashboardController = void 0;
const asyncHandler_util_1 = require("@shared/utils/asyncHandler.util");
const response_util_1 = require("@shared/utils/response.util");
const HttpStatus_enum_1 = require("@domain/enums/HttpStatus.enum");
const AppError_1 = require("@application/errors/AppError");
const ErrorCodes_enum_1 = require("@domain/enums/ErrorCodes.enum");
class HRDashboardController {
    constructor(_getStatsUseCase) {
        this._getStatsUseCase = _getStatsUseCase;
        this.getDashboardStats = (0, asyncHandler_util_1.asyncHandler)(async (req, res) => {
            const comptypeId = req.user?.comptypeId;
            if (!comptypeId) {
                throw new AppError_1.AppError("Comptype ID not found in session", HttpStatus_enum_1.HttpStatus.UNAUTHORIZED, ErrorCodes_enum_1.ErrorCode.UNAUTHORIZED);
            }
            const result = await this._getStatsUseCase.execute(comptypeId);
            (0, response_util_1.sendSuccess)(res, result, "HR Dashboard stats retrieved successfully");
        });
    }
}
exports.HRDashboardController = HRDashboardController;
