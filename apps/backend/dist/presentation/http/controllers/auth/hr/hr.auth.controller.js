"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HRAuthController = void 0;
const asyncHandler_util_1 = require("@shared/utils/asyncHandler.util");
const response_util_1 = require("@shared/utils/response.util");
const AppError_1 = require("@application/errors/AppError");
const ErrorCodes_enum_1 = require("@domain/enums/ErrorCodes.enum");
const HttpStatus_enum_1 = require("@domain/enums/HttpStatus.enum");
class HRAuthController {
    constructor(registerUseCase, onboardingUseCase, verifyOtpUseCase, loginUseCase) {
        this.registerUseCase = registerUseCase;
        this.onboardingUseCase = onboardingUseCase;
        this.verifyOtpUseCase = verifyOtpUseCase;
        this.loginUseCase = loginUseCase;
        this.login = (0, asyncHandler_util_1.asyncHandler)(async (req, res) => {
            const result = await this.loginUseCase.execute(req.body);
            res.cookie("accessToken", result.accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 30 * 60 * 1000,
            });
            (0, response_util_1.sendSuccess)(res, result, "Login successful");
        });
        this.register = (0, asyncHandler_util_1.asyncHandler)(async (req, res) => {
            const result = await this.registerUseCase.execute(req.body);
            (0, response_util_1.sendSuccess)(res, result, "OTP sent successfully", 201);
        });
        this.verifyOtp = (0, asyncHandler_util_1.asyncHandler)(async (req, res) => {
            const result = await this.verifyOtpUseCase.execute(req.body);
            res.cookie("accessToken", result.accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 30 * 60 * 1000,
            });
            (0, response_util_1.sendSuccess)(res, {
                hrUser: result.hrUser,
                comptype: result.comptype,
            }, "OTP verification successful", 200);
        });
        this.updateOnboarding = (0, asyncHandler_util_1.asyncHandler)(async (req, res) => {
            const comptypeId = req.user?.comptypeId;
            if (!comptypeId) {
                throw new AppError_1.AppError("Comptype ID not found in session", HttpStatus_enum_1.HttpStatus.UNAUTHORIZED, ErrorCodes_enum_1.ErrorCode.UNAUTHORIZED);
            }
            const comptype = await this.onboardingUseCase.execute(comptypeId, req.body);
            (0, response_util_1.sendSuccess)(res, comptype, `Comptype onboarding Step ${req.body.step} successful`);
        });
    }
}
exports.HRAuthController = HRAuthController;
