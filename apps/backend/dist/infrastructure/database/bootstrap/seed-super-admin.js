"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedSuperAdmin = void 0;
const account_entity_1 = require("@domain/entities/account.entity");
const Roles_enum_1 = require("@domain/enums/Roles.enum");
const account_status_enum_1 = require("@domain/enums/account.status.enum");
const account_repository_1 = require("@infrastructure/repositories/account.repository");
const bcrypt_service_1 = require("@infrastructure/services/hash/bcrypt.service");
const logger_1 = require("@infrastructure/logger/logger");
const seedSuperAdmin = async () => {
    const accountRepository = new account_repository_1.AccountRepository();
    const hashService = new bcrypt_service_1.BcryptService();
    const email = process.env.SUPER_ADMIN_EMAIL ?? "superadmin@careerhub.local";
    const password = process.env.SUPER_ADMIN_PASSWORD ?? "Admin@123";
    const existing = await accountRepository.findByEmail(email);
    if (existing) {
        return;
    }
    await accountRepository.create(account_entity_1.AccountEntity.create({
        email,
        passwordHash: await hashService.hash(password),
        role: Roles_enum_1.Role.SUPER_ADMIN,
        status: account_status_enum_1.AccountStatus.ACTIVE,
        firstName: "Super",
        lastName: "Admin",
        mustChangePassword: false,
    }));
    logger_1.logger.info(`Seeded default super admin: ${email}`);
};
exports.seedSuperAdmin = seedSuperAdmin;
