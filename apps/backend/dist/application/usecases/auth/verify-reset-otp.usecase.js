"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerifyResetOtpUseCase = void 0;
const AuthError_1 = require("@application/errors/AuthError");
const auth_helpers_1 = require("@application/usecases/shared/auth.helpers");
class VerifyResetOtpUseCase {
    constructor(accountRepository) {
        this.accountRepository = accountRepository;
    }
    async execute(dto) {
        const account = await this.accountRepository.findByEmail(dto.email);
        if (!account) {
            throw new AuthError_1.UnauthorizedError("Invalid or expired OTP");
        }
        const props = account.getProps();
        const isValid = props.resetOtpHash === (0, auth_helpers_1.hashValue)(dto.otp) &&
            Boolean(props.resetOtpExpiresAt && props.resetOtpExpiresAt.getTime() > Date.now());
        if (!isValid) {
            throw new AuthError_1.UnauthorizedError("Invalid or expired OTP");
        }
        return { valid: true };
    }
}
exports.VerifyResetOtpUseCase = VerifyResetOtpUseCase;
