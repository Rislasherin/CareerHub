"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentAuthController = void 0;
const asyncHandler_util_1 = require("@shared/utils/asyncHandler.util");
const response_util_1 = require("@shared/utils/response.util");
const HttpStatus_enum_1 = require("@domain/enums/HttpStatus.enum");
class StudentAuthController {
    constructor(loginUseCase, requestAccessUseCase, setupPasswordUseCase) {
        this.loginUseCase = loginUseCase;
        this.requestAccessUseCase = requestAccessUseCase;
        this.setupPasswordUseCase = setupPasswordUseCase;
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
        this.requestAccess = (0, asyncHandler_util_1.asyncHandler)(async (req, res) => {
            await this.requestAccessUseCase.execute(req.body);
            (0, response_util_1.sendSuccess)(res, null, "Request submitted. Please wait for college admin review.", HttpStatus_enum_1.HttpStatus.CREATED);
        });
        this.setupPassword = (0, asyncHandler_util_1.asyncHandler)(async (req, res) => {
            const { token, password } = req.body;
            const result = await this.setupPasswordUseCase.execute(token, password);
            res.cookie("accessToken", result.accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 30 * 60 * 1000,
            });
            (0, response_util_1.sendSuccess)(res, result, "Password set successfully. Profile activated.");
        });
    }
}
exports.StudentAuthController = StudentAuthController;
