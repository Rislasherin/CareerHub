"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetPasswordUseCase = void 0;
const AuthError_1 = require("@application/errors/AuthError");
const account_entity_1 = require("@domain/entities/account.entity");
const account_status_enum_1 = require("@domain/enums/account.status.enum");
const auth_helpers_1 = require("@application/usecases/shared/auth.helpers");
class SetPasswordUseCase {
    constructor(accountRepository, hashService, jwtService) {
        this.accountRepository = accountRepository;
        this.hashService = hashService;
        this.jwtService = jwtService;
    }
    async execute(dto) {
        const account = await this.accountRepository.findByInviteTokenHash((0, auth_helpers_1.hashValue)(dto.token));
        if (!account) {
            throw new AuthError_1.UnauthorizedError("Invite link is invalid or expired");
        }
        const props = account.getProps();
        if (!props.inviteExpiresAt || props.inviteExpiresAt.getTime() < Date.now()) {
            throw new AuthError_1.UnauthorizedError("Invite link is invalid or expired");
        }
        const updated = await this.accountRepository.update(account_entity_1.AccountEntity.create({
            ...props,
            passwordHash: await this.hashService.hash(dto.password),
            status: account_status_enum_1.AccountStatus.ACTIVE,
            mustChangePassword: false,
            inviteTokenHash: undefined,
            inviteExpiresAt: undefined,
        }));
        return (0, auth_helpers_1.buildAuthResponse)(updated, this.jwtService);
    }
}
exports.SetPasswordUseCase = SetPasswordUseCase;
