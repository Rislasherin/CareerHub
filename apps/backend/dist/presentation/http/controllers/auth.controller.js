"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const asyncHandler_util_1 = require("@shared/utils/asyncHandler.util");
const response_util_1 = require("@shared/utils/response.util");
const message_constants_1 = require("@shared/constants/message.constants");
const http_status_constants_1 = require("@shared/constants/http-status.constants");
const cookie_constants_1 = require("@shared/constants/cookie.constants");
const auth_error_1 = require("@application/errors/auth.error");
class AuthController {
    constructor(loginUseCases, refreshTokenUseCase, logoutUseCase, forgotPasswordUseCase, resetPasswordUseCase, studentSetPasswordUseCase, collegeSignupUseCase, comptypeSignupUseCase) {
        this.loginUseCases = loginUseCases;
        this.refreshTokenUseCase = refreshTokenUseCase;
        this.logoutUseCase = logoutUseCase;
        this.forgotPasswordUseCase = forgotPasswordUseCase;
        this.resetPasswordUseCase = resetPasswordUseCase;
        this.studentSetPasswordUseCase = studentSetPasswordUseCase;
        this.collegeSignupUseCase = collegeSignupUseCase;
        this.comptypeSignupUseCase = comptypeSignupUseCase;
        this.login = (0, asyncHandler_util_1.asyncHandler)(async (request, response) => {
            const dto = request.body;
            const useCase = this.loginUseCases.get(dto.role);
            if (!useCase) {
                throw new auth_error_1.UnauthorizedError();
            }
            const result = await useCase.execute(dto);
            this.attachRefreshCookie(response, result.refreshToken);
            (0, response_util_1.sendSuccess)(response, {
                accessToken: result.accessToken,
                user: result.user,
            }, message_constants_1.MESSAGE_CONSTANTS.AUTH.LOGIN_SUCCESS);
        });
        this.refresh = (0, asyncHandler_util_1.asyncHandler)(async (request, response) => {
            const refreshToken = request.cookies[cookie_constants_1.COOKIE_NAMES.REFRESH_TOKEN];
            if (!refreshToken) {
                throw new auth_error_1.UnauthorizedError(message_constants_1.MESSAGE_CONSTANTS.AUTH.REFRESH_TOKEN_MISSING);
            }
            const result = await this.refreshTokenUseCase.execute(refreshToken);
            this.attachRefreshCookie(response, result.refreshToken);
            (0, response_util_1.sendSuccess)(response, {
                accessToken: result.accessToken,
                user: result.user,
            }, message_constants_1.MESSAGE_CONSTANTS.AUTH.REFRESH_SUCCESS);
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
        this.studentSetPassword = (0, asyncHandler_util_1.asyncHandler)(async (request, response) => {
            if (!request.user) {
                throw new auth_error_1.UnauthorizedError();
            }
            await this.studentSetPasswordUseCase.execute(request.user.sub, request.body);
            (0, response_util_1.sendSuccess)(response, null, message_constants_1.MESSAGE_CONSTANTS.AUTH.PASSWORD_SET_SUCCESS);
        });
        this.collegeSignup = (0, asyncHandler_util_1.asyncHandler)(async (request, response) => {
            const result = await this.collegeSignupUseCase.execute(request.body);
            (0, response_util_1.sendSuccess)(response, result, message_constants_1.MESSAGE_CONSTANTS.SIGNUP.COLLEGE_CREATED, http_status_constants_1.HTTP_STATUS.CREATED);
        });
        this.comptypeSignup = (0, asyncHandler_util_1.asyncHandler)(async (request, response) => {
            const result = await this.comptypeSignupUseCase.execute(request.body);
            (0, response_util_1.sendSuccess)(response, result, message_constants_1.MESSAGE_CONSTANTS.SIGNUP.COMPtype_CREATED, http_status_constants_1.HTTP_STATUS.CREATED);
        });
    }
    attachRefreshCookie(response, refreshToken) {
        response.cookie(cookie_constants_1.COOKIE_NAMES.REFRESH_TOKEN, refreshToken, cookie_constants_1.REFRESH_COOKIE_OPTIONS);
    }
}
exports.AuthController = AuthController;
