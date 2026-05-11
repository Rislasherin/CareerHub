"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InterviewerAuthController = void 0;
const asyncHandler_util_1 = require("@shared/utils/asyncHandler.util");
const response_util_1 = require("@shared/utils/response.util");
class InterviewerAuthController {
    constructor(loginUseCase) {
        this.loginUseCase = loginUseCase;
        this.login = (0, asyncHandler_util_1.asyncHandler)(async (req, res) => {
            const result = await this.loginUseCase.execute(req.body);
            (0, response_util_1.sendSuccess)(res, result, "interviewer login successful");
        });
    }
}
exports.InterviewerAuthController = InterviewerAuthController;
