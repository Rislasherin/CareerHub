"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirstLoginSetPasswordUseCase = void 0;
const auth_error_1 = require("@application/errors/auth.error");
const message_constants_1 = require("@shared/constants/message.constants");
class FirstLoginSetPasswordUseCase {
    constructor(repository, hashService, allowedRole) {
        this.repository = repository;
        this.hashService = hashService;
        this.allowedRole = allowedRole;
    }
    async execute(accountId, dto) {
        const account = await this.repository.findById(accountId);
        if (!account || account.getRole() !== this.allowedRole) {
            throw new auth_error_1.UnauthorizedError();
        }
        if (!account.isFirstLogin()) {
            throw new auth_error_1.ForbiddenError(message_constants_1.MESSAGE_CONSTANTS.AUTH.FIRST_LOGIN_ONLY);
        }
        account.setPasswordHash(await this.hashService.hash(dto.password));
        account.completeFirstLogin();
        account.clearResetToken();
        account.setRefreshTokenHash(undefined);
        await this.repository.save(account);
    }
}
exports.FirstLoginSetPasswordUseCase = FirstLoginSetPasswordUseCase;
