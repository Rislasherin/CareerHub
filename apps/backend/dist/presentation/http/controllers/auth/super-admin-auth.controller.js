"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuperAdminAuthController = void 0;
const cookie_constants_1 = require("@shared/constants/cookie.constants");
const message_constants_1 = require("@shared/constants/message.constants");
const asyncHandler_util_1 = require("@shared/utils/asyncHandler.util");
const response_util_1 = require("@shared/utils/response.util");
class SuperAdminAuthController {
    constructor(loginUseCase) {
        this.loginUseCase = loginUseCase;
        this.login = (0, asyncHandler_util_1.asyncHandler)(async (request, response) => {
            const result = await this.loginUseCase.execute(request.body);
            response.cookie(cookie_constants_1.COOKIE_NAMES.REFRESH_TOKEN, result.refreshToken, cookie_constants_1.REFRESH_COOKIE_OPTIONS);
            (0, response_util_1.sendSuccess)(response, { accessToken: result.accessToken, user: result.user }, message_constants_1.MESSAGE_CONSTANTS.AUTH.LOGIN_SUCCESS);
        });
    }
}
exports.SuperAdminAuthController = SuperAdminAuthController;
