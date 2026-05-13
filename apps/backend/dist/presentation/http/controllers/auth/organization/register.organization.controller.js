"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterOrganizationController = void 0;
const asyncHandler_util_1 = require("@shared/utils/asyncHandler.util");
const response_util_1 = require("@shared/utils/response.util");
class RegisterOrganizationController {
    constructor(_registerOrganizationUseCase) {
        this._registerOrganizationUseCase = _registerOrganizationUseCase;
        this.register = (0, asyncHandler_util_1.asyncHandler)(async (req, res) => {
            const result = await this._registerOrganizationUseCase.execute(req.body);
            (0, response_util_1.sendSuccess)(res, result, "Organization registration successful", 201);
        });
    }
}
exports.RegisterOrganizationController = RegisterOrganizationController;
