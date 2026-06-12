"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshTokenController = void 0;
const asyncHandler_util_1 = require("@shared/utils/asyncHandler.util");
const response_util_1 = require("@shared/utils/response.util");
const AppError_1 = require("@application/errors/AppError");
const ErrorCodes_enum_1 = require("@domain/enums/ErrorCodes.enum");
const HttpStatus_enum_1 = require("@domain/enums/HttpStatus.enum");
const user_status_enum_1 = require("@domain/enums/user.status.enum");
const Roles_enum_1 = require("@domain/enums/Roles.enum");
const env_validator_1 = require("@infrastructure/config/env.validator");
class RefreshTokenController {
    constructor(_jwtService, _studentRepository, _hrUserRepository, _interviewerRepository, _collegeAdminRepository, _superAdminRepository) {
        this._jwtService = _jwtService;
        this._studentRepository = _studentRepository;
        this._hrUserRepository = _hrUserRepository;
        this._interviewerRepository = _interviewerRepository;
        this._collegeAdminRepository = _collegeAdminRepository;
        this._superAdminRepository = _superAdminRepository;
        this.refresh = (0, asyncHandler_util_1.asyncHandler)(async (req, res) => {
            const refreshToken = req.cookies?.refreshToken;
            if (!refreshToken) {
                throw new AppError_1.AppError("Refresh token not found", HttpStatus_enum_1.HttpStatus.UNAUTHORIZED, ErrorCodes_enum_1.ErrorCode.UNAUTHORIZED);
            }
            // Verify the refresh token (throws if invalid/expired)
            const payload = this._jwtService.verifyRefreshToken(refreshToken);
            // Check user status before refreshing
            let user;
            switch (payload.role) {
                case Roles_enum_1.Role.STUDENT:
                    user = await this._studentRepository.findById(payload.id);
                    break;
                case Roles_enum_1.Role.HR:
                    user = await this._hrUserRepository.findById(payload.id);
                    break;
                case Roles_enum_1.Role.INTERVIEWER:
                    user = await this._interviewerRepository.findById(payload.id);
                    break;
                case Roles_enum_1.Role.COLLEGE_ADMIN:
                    user = await this._collegeAdminRepository.findById(payload.id);
                    break;
                case Roles_enum_1.Role.SUPER_ADMIN:
                    user = await this._superAdminRepository.findById(payload.id);
                    break;
            }
            if (!user || user.status === user_status_enum_1.UserStatus.BLOCKED) {
                res.clearCookie("accessToken");
                res.clearCookie("refreshToken");
                throw new AppError_1.AppError("Your account has been blocked or no longer exists.", HttpStatus_enum_1.HttpStatus.UNAUTHORIZED, ErrorCodes_enum_1.ErrorCode.UNAUTHORIZED);
            }
            // Issue a new access token
            const newAccessToken = this._jwtService.signAccessToken({
                id: payload.id,
                role: payload.role,
                orgId: payload.orgId,
                companyId: payload.companyId,
            });
            res.cookie("accessToken", newAccessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: env_validator_1.env.COOKIE_MAX_AGE_MS, // using standard cookie max age
            });
            (0, response_util_1.sendSuccess)(res, null, "Token refreshed successfully");
        });
        this.status = (0, asyncHandler_util_1.asyncHandler)(async (_req, res) => {
            // This is essentially a no-op that just returns success.
            // The actual status check happens in the AuthMiddleware that should protect this route.
            (0, response_util_1.sendSuccess)(res, _req.user, "Account is active");
        });
        this.logout = (0, asyncHandler_util_1.asyncHandler)(async (_req, res) => {
            res.clearCookie("accessToken");
            res.clearCookie("refreshToken");
            (0, response_util_1.sendSuccess)(res, null, "Logged out successfully");
        });
    }
}
exports.RefreshTokenController = RefreshTokenController;
