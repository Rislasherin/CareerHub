"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshTokenUseCase = void 0;
const auth_error_1 = require("@application/errors/auth.error");
const message_constants_1 = require("@shared/constants/message.constants");
const auth_response_mapper_1 = require("@infrastructure/mappers/auth-response.mapper");
class RefreshTokenUseCase {
    constructor(repositories, hashService, tokenService) {
        this.repositories = repositories;
        this.hashService = hashService;
        this.tokenService = tokenService;
    }
    async execute(refreshToken) {
        const payload = this.tokenService.verifyRefreshToken(refreshToken);
        const repository = this.repositories.find((item) => item.role === payload.role);
        if (!repository) {
            throw new auth_error_1.UnauthorizedError(message_constants_1.MESSAGE_CONSTANTS.AUTH.REFRESH_TOKEN_INVALID);
        }
        const account = await repository.findById(payload.sub);
        if (!account || !account.getRefreshTokenHash()) {
            throw new auth_error_1.UnauthorizedError(message_constants_1.MESSAGE_CONSTANTS.AUTH.REFRESH_TOKEN_INVALID);
        }
        const isValidToken = await this.hashService.compare(refreshToken, account.getRefreshTokenHash());
        if (!isValidToken) {
            throw new auth_error_1.UnauthorizedError(message_constants_1.MESSAGE_CONSTANTS.AUTH.REFRESH_TOKEN_INVALID);
        }
        const newPayload = {
            sub: account.getId(),
            role: account.getRole(),
            email: account.getEmail(),
            organizationId: account.getOrganizationId(),
            comptypeId: account.getComptypeId(),
        };
        const newAccessToken = this.tokenService.generateAccessToken(newPayload);
        const newRefreshToken = this.tokenService.generateRefreshToken(newPayload);
        account.setRefreshTokenHash(await this.hashService.hash(newRefreshToken));
        await repository.save(account);
        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
            user: (0, auth_response_mapper_1.toAuthUserResponse)(account),
        };
    }
}
exports.RefreshTokenUseCase = RefreshTokenUseCase;
