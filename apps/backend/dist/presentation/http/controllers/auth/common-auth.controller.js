"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommonAuthController = void 0;
const auth_error_1 = require("@application/errors/auth.error");
const cookie_constants_1 = require("@shared/constants/cookie.constants");
const message_constants_1 = require("@shared/constants/message.constants");
const http_status_constants_1 = require("@shared/constants/http-status.constants");
const asyncHandler_util_1 = require("@shared/utils/asyncHandler.util");
const response_util_1 = require("@shared/utils/response.util");
class CommonAuthController {
    constructor(refreshTokenUseCase, logoutUseCase, forgotPasswordUseCase, resetPasswordUseCase) {
        this.refreshTokenUseCase = refreshTokenUseCase;
        this.logoutUseCase = logoutUseCase;
        this.forgotPasswordUseCase = forgotPasswordUseCase;
        this.resetPasswordUseCase = resetPasswordUseCase;
        this.refresh = (0, asyncHandler_util_1.asyncHandler)(async (request, response) => {
            const refreshToken = request.cookies[cookie_constants_1.COOKIE_NAMES.REFRESH_TOKEN];
            if (!refreshToken) {
                throw new auth_error_1.UnauthorizedError(message_constants_1.MESSAGE_CONSTANTS.AUTH.REFRESH_TOKEN_MISSING);
            }
            const result = await this.refreshTokenUseCase.execute(refreshToken);
            response.cookie(cookie_constants_1.COOKIE_NAMES.REFRESH_TOKEN, result.refreshToken, cookie_constants_1.REFRESH_COOKIE_OPTIONS);
            (0, response_util_1.sendSuccess)(response, { accessToken: result.accessToken, user: result.user }, message_constants_1.MESSAGE_CONSTANTS.AUTH.REFRESH_SUCCESS);
        });
        this.logout = (0, asyncHandler_util_1.asyncHandler)(async (request, response) => {
            if (request.user) {
                await this.logoutUseCase.execute(request.user.role, request.user.sub);
            }
            response.clearCookie(cookie_constants_1.COOKIE_NAMES.REFRESH_TOKEN, cookie_constants_1.REFRESH_COOKIE_OPTIONS);
            (0, response_util_1.sendSuccess)(response, null, message_constants_1.MESSAGE_CONSTANTS.COMMON.LOGOUT_SUCCESS, http_status_constants_1.HTTP_STATUS.OK);
        });
        this.forgotPassword = (0, asyncHandler_util_1.asyncHandler)(async (request, response) => {
            await this.forgotPasswordUseCase.execute(request.body);
            (0, response_util_1.sendSuccess)(response, null, message_constants_1.MESSAGE_CONSTANTS.AUTH.PASSWORD_RESET_SENT);
        });
        this.resetPassword = (0, asyncHandler_util_1.asyncHandler)(async (request, response) => {
            await this.resetPasswordUseCase.execute(request.body);
            response.clearCookie(cookie_constants_1.COOKIE_NAMES.REFRESH_TOKEN, cookie_constants_1.REFRESH_COOKIE_OPTIONS);
            (0, response_util_1.sendSuccess)(response, null, message_constants_1.MESSAGE_CONSTANTS.AUTH.PASSWORD_RESET_SUCCESS);
        });
    }
}
exports.CommonAuthController = CommonAuthController;
