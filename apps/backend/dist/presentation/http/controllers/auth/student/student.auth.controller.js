"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentAuthController = void 0;
const HttpStatus_enum_1 = require("@domain/enums/HttpStatus.enum");
const asyncHandler_util_1 = require("@shared/utils/asyncHandler.util");
const response_util_1 = require("@shared/utils/response.util");
const env_validator_1 = require("@infrastructure/config/env.validator");
class StudentAuthController {
    constructor(_loginUseCase, _requestAccessUseCase, _setupPasswordUseCase, _getProfileUseCase, _verifyTokenUseCase) {
        this._loginUseCase = _loginUseCase;
        this._requestAccessUseCase = _requestAccessUseCase;
        this._setupPasswordUseCase = _setupPasswordUseCase;
        this._getProfileUseCase = _getProfileUseCase;
        this._verifyTokenUseCase = _verifyTokenUseCase;
        this.verifyInvitationToken = (0, asyncHandler_util_1.asyncHandler)(async (req, res) => {
            const { token } = req.params;
            const student = await this._verifyTokenUseCase.execute(token);
            (0, response_util_1.sendSuccess)(res, student, "Token verified successfully");
        });
        this.login = (0, asyncHandler_util_1.asyncHandler)(async (req, res) => {
            const result = await this._loginUseCase.execute(req.body);
            res.cookie("accessToken", result.accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: env_validator_1.env.COOKIE_MAX_AGE_MS,
            });
            (0, response_util_1.sendSuccess)(res, {
                student: result.student,
                isFirstLogin: result.student.isFirstLogin,
            }, "student login successful");
        });
        this.getMe = (0, asyncHandler_util_1.asyncHandler)(async (req, res) => {
            const studentId = req.user?.id;
            const student = await this._getProfileUseCase.execute(studentId);
            (0, response_util_1.sendSuccess)(res, student, "Student profile retrieved successfully");
        });
        this.requestAccess = (0, asyncHandler_util_1.asyncHandler)(async (req, res) => {
            await this._requestAccessUseCase.execute(req.body);
            (0, response_util_1.sendSuccess)(res, null, "Request submitted. Please wait for college admin review.", HttpStatus_enum_1.HttpStatus.CREATED);
        });
        this.setupPassword = (0, asyncHandler_util_1.asyncHandler)(async (req, res) => {
            const { token, password } = req.body;
            const result = await this._setupPasswordUseCase.execute(token, password);
            res.cookie("accessToken", result.accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: env_validator_1.env.COOKIE_MAX_AGE_MS,
            });
            (0, response_util_1.sendSuccess)(res, result, "Password set successfully. Profile activated.");
        });
    }
}
exports.StudentAuthController = StudentAuthController;
