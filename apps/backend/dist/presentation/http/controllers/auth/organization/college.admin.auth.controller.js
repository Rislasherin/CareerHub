"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollegeAdminAuthController = void 0;
const asyncHandler_util_1 = require("@shared/utils/asyncHandler.util");
const response_util_1 = require("@shared/utils/response.util");
const env_validator_1 = require("@infrastructure/config/env.validator");
class CollegeAdminAuthController {
    constructor(_registerUseCase, _verifyOtpUseCase, _loginUseCase, _updateOnboardingUseCase) {
        this._registerUseCase = _registerUseCase;
        this._verifyOtpUseCase = _verifyOtpUseCase;
        this._loginUseCase = _loginUseCase;
        this._updateOnboardingUseCase = _updateOnboardingUseCase;
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
        this.register = (0, asyncHandler_util_1.asyncHandler)(async (req, res) => {
            const result = await this._registerUseCase.execute(req.body);
            (0, response_util_1.sendSuccess)(res, result, "OTP sent successfully", 201);
        });
        this.verifyOtp = (0, asyncHandler_util_1.asyncHandler)(async (req, res) => {
            const result = await this._verifyOtpUseCase.execute(req.body);
            res.cookie("accessToken", result.accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: env_validator_1.env.COOKIE_MAX_AGE_MS,
            });
            (0, response_util_1.sendSuccess)(res, {
                collegeAdmin: result.collegeAdmin,
            }, "OTP verification successful", 200);
        });
        this.updateOnboarding = (0, asyncHandler_util_1.asyncHandler)(async (req, res) => {
            const { orgId } = req.user; // From auth middleware
            const result = await this._updateOnboardingUseCase.execute(orgId, req.body);
            (0, response_util_1.sendSuccess)(res, result, "Onboarding updated successfully");
        });
    }
}
exports.CollegeAdminAuthController = CollegeAdminAuthController;
