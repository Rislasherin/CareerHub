"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HrAuthController = void 0;
const asyncHandler_util_1 = require("@shared/utils/asyncHandler.util");
const response_util_1 = require("@shared/utils/response.util");
class HrAuthController {
    constructor(loginUseCase) {
        this.loginUseCase = loginUseCase;
        this.login = (0, asyncHandler_util_1.asyncHandler)(async (req, res) => {
            const result = await this.loginUseCase.execute(req.body);
            (0, response_util_1.sendSuccess)(res, result, "hr login successful");
        });
    }
}
exports.HrAuthController = HrAuthController;
