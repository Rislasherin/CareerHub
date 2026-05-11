"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForgotPasswordUseCase = void 0;
const env_validator_1 = require("@infrastructure/config/env.validator");
const crypto_1 = require("crypto");
class ForgotPasswordUseCase {
    constructor(repositories, randomService, hashService, emailService) {
        this.repositories = repositories;
        this.randomService = randomService;
        this.hashService = hashService;
        this.emailService = emailService;
    }
    async execute(dto) {
        for (const repository of this.repositories) {
            const account = await repository.findByEmail(dto.email);
            if (!account) {
                continue;
            }
            const rawToken = this.randomService.generateToken(48);
            const tokenHash = (0, crypto_1.createHash)("sha256").update(rawToken).digest("hex");
            const expiresAt = new Date(Date.now() + env_validator_1.env.PASSWORD_RESET_TTL_MS);
            account.setResetToken(tokenHash, expiresAt);
            await repository.save(account);
            const resetUrl = `${env_validator_1.env.CLIENT_URL}/reset-password?token=${rawToken}`;
            await this.emailService.send({
                to: account.getEmail(),
                subject: "CareerHub password reset",
                text: `Reset your password using this link: ${resetUrl}`,
                html: `<p>Reset your password using this link:</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
            });
            return;
        }
    }
}
exports.ForgotPasswordUseCase = ForgotPasswordUseCase;
