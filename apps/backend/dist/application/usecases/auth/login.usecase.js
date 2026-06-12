"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginUseCase = void 0;
const auth_error_1 = require("@application/errors/auth.error");
const message_constants_1 = require("@shared/constants/message.constants");
const auth_response_mapper_1 = require("@infrastructure/mappers/auth-response.mapper");
class LoginUseCase {
    constructor(repository, hashService, tokenService) {
        this.repository = repository;
        this.hashService = hashService;
        this.tokenService = tokenService;
    }
    async execute(dto) {
        const account = await this.repository.findByEmail(dto.email);
        if (!account) {
            throw new auth_error_1.InvalidCredentialsError();
        }
        if (account.isBlocked()) {
            throw new auth_error_1.UnauthorizedError(message_constants_1.MESSAGE_CONSTANTS.AUTH.ACCOUNT_BLOCKED);
        }
        const isPasswordValid = await this.hashService.compare(dto.password, account.getPasswordHash());
        if (!isPasswordValid) {
            throw new auth_error_1.InvalidCredentialsError();
        }
        const payload = {
            sub: account.getId(),
            role: account.getRole(),
            email: account.getEmail(),
            organizationId: account.getOrganizationId(),
            comptypeId: account.getComptypeId(),
        };
        const accessToken = this.tokenService.generateAccessToken(payload);
        const refreshToken = this.tokenService.generateRefreshToken(payload);
        const refreshTokenHash = await this.hashService.hash(refreshToken);
        account.setRefreshTokenHash(refreshTokenHash);
        await this.repository.save(account);
        return {
            accessToken,
            refreshToken,
            user: (0, auth_response_mapper_1.toAuthUserResponse)(account),
        };
    }
}
exports.LoginUseCase = LoginUseCase;
