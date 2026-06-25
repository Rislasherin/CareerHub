"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuperAdminAuthController = void 0;
const asyncHandler_util_1 = require("@shared/utils/asyncHandler.util");
const response_util_1 = require("@shared/utils/response.util");
const env_validator_1 = require("@infrastructure/config/env.validator");
class SuperAdminAuthController {
    constructor(_loginUseCase) {
        this._loginUseCase = _loginUseCase;
        this.login = (0, asyncHandler_util_1.asyncHandler)(async (req, res) => {
            const result = await this._loginUseCase.execute(req.body);
            res.cookie("accessToken", result.accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: env_validator_1.env.COOKIE_MAX_AGE_MS,
            });
            (0, response_util_1.sendSuccess)(res, result, "Login successful");
        });
    }
}
exports.SuperAdminAuthController = SuperAdminAuthController;
