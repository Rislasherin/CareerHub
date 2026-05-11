"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleAuthController = void 0;
const asyncHandler_util_1 = require("@shared/utils/asyncHandler.util");
const response_util_1 = require("@shared/utils/response.util");
class RoleAuthController {
    constructor(role, loginUseCase) {
        this.role = role;
        this.loginUseCase = loginUseCase;
        this.login = (0, asyncHandler_util_1.asyncHandler)(async (req, res) => {
            const result = await this.loginUseCase.execute(this.role, req.body);
            (0, response_util_1.sendSuccess)(res, result, `${this.role} login successful`);
        });
    }
}
exports.RoleAuthController = RoleAuthController;
