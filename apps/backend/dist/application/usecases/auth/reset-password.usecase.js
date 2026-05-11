"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResetPasswordUseCase = void 0;
const auth_error_1 = require("@application/errors/auth.error");
const message_constants_1 = require("@shared/constants/message.constants");
const crypto_1 = require("crypto");
class ResetPasswordUseCase {
    constructor(repositories, hashService) {
        this.repositories = repositories;
        this.hashService = hashService;
    }
    async execute(dto) {
        const resetTokenHash = (0, crypto_1.createHash)("sha256").update(dto.token).digest("hex");
        for (const repository of this.repositories) {
            const matchingAccount = await repository.findByResetTokenHash(resetTokenHash);
            if (!matchingAccount) {
                continue;
            }
            const expiresAt = matchingAccount.getResetTokenExpiresAt();
            if (!expiresAt || expiresAt.getTime() < Date.now()) {
                throw new auth_error_1.UnauthorizedError(message_constants_1.MESSAGE_CONSTANTS.AUTH.REFRESH_TOKEN_INVALID);
            }
            matchingAccount.setPasswordHash(await this.hashService.hash(dto.password));
            matchingAccount.clearResetToken();
            matchingAccount.setRefreshTokenHash(undefined);
            matchingAccount.completeFirstLogin();
            await repository.save(matchingAccount);
            return;
        }
        throw new auth_error_1.UnauthorizedError(message_constants_1.MESSAGE_CONSTANTS.AUTH.REFRESH_TOKEN_INVALID);
    }
}
exports.ResetPasswordUseCase = ResetPasswordUseCase;
