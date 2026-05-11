"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogoutUseCase = void 0;
class LogoutUseCase {
    constructor(repositories) {
        this.repositories = repositories;
    }
    async execute(role, accountId) {
        const repository = this.repositories.find((item) => item.role === role);
        if (!repository) {
            return;
        }
        const account = await repository.findById(accountId);
        if (!account) {
            return;
        }
        account.setRefreshTokenHash(undefined);
        await repository.save(account);
    }
}
exports.LogoutUseCase = LogoutUseCase;
