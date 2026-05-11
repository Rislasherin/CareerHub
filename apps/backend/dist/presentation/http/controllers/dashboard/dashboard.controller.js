"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
const asyncHandler_util_1 = require("@shared/utils/asyncHandler.util");
const response_util_1 = require("@shared/utils/response.util");
const AuthError_1 = require("@application/errors/AuthError");
class DashboardController {
    constructor(accountRepository) {
        this.accountRepository = accountRepository;
        this.me = (0, asyncHandler_util_1.asyncHandler)(async (req, res) => {
            if (!req.user?.id) {
                throw new AuthError_1.UnauthorizedError();
            }
            const account = await this.accountRepository.findById(req.user.id);
            if (!account) {
                throw new AuthError_1.UnauthorizedError();
            }
            (0, response_util_1.sendSuccess)(res, account.getProps(), "Profile loaded");
        });
    }
}
exports.DashboardController = DashboardController;
