"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentAuthController = void 0;
const auth_error_1 = require("@application/errors/auth.error");
const cookie_constants_1 = require("@shared/constants/cookie.constants");
const message_constants_1 = require("@shared/constants/message.constants");
const asyncHandler_util_1 = require("@shared/utils/asyncHandler.util");
const response_util_1 = require("@shared/utils/response.util");
class StudentAuthController {
    constructor(loginUseCase, firstLoginSetPasswordUseCase) {
        this.loginUseCase = loginUseCase;
        this.firstLoginSetPasswordUseCase = firstLoginSetPasswordUseCase;
        this.login = (0, asyncHandler_util_1.asyncHandler)(async (request, response) => {
            const result = await this.loginUseCase.execute(request.body);
            response.cookie(cookie_constants_1.COOKIE_NAMES.REFRESH_TOKEN, result.refreshToken, cookie_constants_1.REFRESH_COOKIE_OPTIONS);
            (0, response_util_1.sendSuccess)(response, { accessToken: result.accessToken, user: result.user }, message_constants_1.MESSAGE_CONSTANTS.AUTH.LOGIN_SUCCESS);
        });
        this.setPassword = (0, asyncHandler_util_1.asyncHandler)(async (request, response) => {
            if (!request.user) {
                throw new auth_error_1.UnauthorizedError();
            }
            await this.firstLoginSetPasswordUseCase.execute(request.user.sub, request.body);
            (0, response_util_1.sendSuccess)(response, null, message_constants_1.MESSAGE_CONSTANTS.AUTH.PASSWORD_SET_SUCCESS);
        });
    }
}
exports.StudentAuthController = StudentAuthController;
