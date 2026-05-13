"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshTokenController = void 0;
const asyncHandler_util_1 = require("@shared/utils/asyncHandler.util");
const response_util_1 = require("@shared/utils/response.util");
const AppError_1 = require("@application/errors/AppError");
const ErrorCodes_enum_1 = require("@domain/enums/ErrorCodes.enum");
const HttpStatus_enum_1 = require("@domain/enums/HttpStatus.enum");
class RefreshTokenController {
    constructor(jwtService) {
        this.jwtService = jwtService;
        this.refresh = (0, asyncHandler_util_1.asyncHandler)(async (req, res) => {
            const refreshToken = req.cookies?.refreshToken;
            if (!refreshToken) {
                throw new AppError_1.AppError("Refresh token not found", HttpStatus_enum_1.HttpStatus.UNAUTHORIZED, ErrorCodes_enum_1.ErrorCode.UNAUTHORIZED);
            }
            // Verify the refresh token (throws if invalid/expired)
            const payload = this.jwtService.verifyRefreshToken(refreshToken);
            // Issue a new access token
            const newAccessToken = this.jwtService.signAccessToken({
                id: payload.id,
                role: payload.role,
                orgId: payload.orgId,
                companyId: payload.companyId,
            });
            res.cookie("accessToken", newAccessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 15 * 60 * 1000, // 15 minutes
            });
            (0, response_util_1.sendSuccess)(res, null, "Token refreshed successfully");
        });
        this.logout = (0, asyncHandler_util_1.asyncHandler)(async (_req, res) => {
            res.clearCookie("accessToken");
            res.clearCookie("refreshToken");
            (0, response_util_1.sendSuccess)(res, null, "Logged out successfully");
        });
    }
}
exports.RefreshTokenController = RefreshTokenController;
