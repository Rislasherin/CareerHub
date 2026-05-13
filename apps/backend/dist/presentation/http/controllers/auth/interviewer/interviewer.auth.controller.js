"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InterviewerAuthController = void 0;
const asyncHandler_util_1 = require("@shared/utils/asyncHandler.util");
const response_util_1 = require("@shared/utils/response.util");
class InterviewerAuthController {
    constructor(activateUseCase, loginUseCase) {
        this.activateUseCase = activateUseCase;
        this.loginUseCase = loginUseCase;
        this.activate = (0, asyncHandler_util_1.asyncHandler)(async (req, res) => {
            // @ts-ignore
            const interviewerId = req.user.id;
            const { password } = req.body;
            const email = req.query.email;
            const result = await this.activateUseCase.execute(interviewerId, password, email);
            res.cookie("accessToken", result.accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 30 * 60 * 1000, // 30 minutes
            });
            (0, response_util_1.sendSuccess)(res, { user: result.user }, "Account activated successfully");
        });
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
    }
}
exports.InterviewerAuthController = InterviewerAuthController;
