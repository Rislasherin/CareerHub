"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountMapper = void 0;
const account_entity_1 = require("@domain/entities/account.entity");
class AccountMapper {
    static toEntity(document) {
        return account_entity_1.AccountEntity.create({
            id: document._id.toString(),
            email: document.email,
            passwordHash: document.passwordHash,
            role: document.role,
            status: document.status,
            firstName: document.firstName,
            lastName: document.lastName,
            phone: document.phone ?? undefined,
            organizationId: document.organizationId?.toString(),
            comptypeId: document.comptypeId?.toString(),
            department: document.department ?? undefined,
            designation: document.designation ?? undefined,
            rollNumber: document.rollNumber ?? undefined,
            employeeId: document.employeeId ?? undefined,
            inviteTokenHash: document.inviteTokenHash ?? undefined,
            inviteExpiresAt: document.inviteExpiresAt ?? undefined,
            resetOtpHash: document.resetOtpHash ?? undefined,
            resetOtpExpiresAt: document.resetOtpExpiresAt ?? undefined,
            refreshTokenHash: document.refreshTokenHash ?? undefined,
            mustChangePassword: document.mustChangePassword,
            createdAt: document.createdAt,
            updatedAt: document.updatedAt,
        });
    }
}
exports.AccountMapper = AccountMapper;
