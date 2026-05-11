"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentAuthController = void 0;
const asyncHandler_util_1 = require("@shared/utils/asyncHandler.util");
const response_util_1 = require("@shared/utils/response.util");
class StudentAuthController {
    constructor(loginUseCase) {
        this.loginUseCase = loginUseCase;
        this.login = (0, asyncHandler_util_1.asyncHandler)(async (req, res) => {
            const result = await this.loginUseCase.execute(req.body);
            res.cookie("accessToken", result.accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 30 * 60 * 1000,
            });
            (0, response_util_1.sendSuccess)(res, {
                student: result.student,
                isFirstLogin: result.student.isFirstLogin,
            }, "student login successful");
        });
    }
}
exports.StudentAuthController = StudentAuthController;
