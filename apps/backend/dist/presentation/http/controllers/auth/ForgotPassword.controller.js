"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForgotPasswordController = void 0;
const asyncHandler_util_1 = require("@shared/utils/asyncHandler.util");
const response_util_1 = require("@shared/utils/response.util");
class ForgotPasswordController {
    constructor(_forgotPasswordUseCase, _resetPasswordUseCase) {
        this._forgotPasswordUseCase = _forgotPasswordUseCase;
        this._resetPasswordUseCase = _resetPasswordUseCase;
        this.forgotPassword = (0, asyncHandler_util_1.asyncHandler)(async (req, res) => {
            const { email } = req.body;
            await this._forgotPasswordUseCase.execute(email);
            (0, response_util_1.sendSuccess)(res, null, "If an account exists with that email, a password reset link has been sent.");
        });
        this.resetPassword = (0, asyncHandler_util_1.asyncHandler)(async (req, res) => {
            const { token, password } = req.body;
            await this._resetPasswordUseCase.execute(token, password);
            (0, response_util_1.sendSuccess)(res, null, "Password reset successfully.");
        });
    }
}
exports.ForgotPasswordController = ForgotPasswordController;
