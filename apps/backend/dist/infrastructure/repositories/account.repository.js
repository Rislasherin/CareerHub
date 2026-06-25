"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongooseAccountRepository = void 0;
const account_entity_1 = require("@domain/entities/account.entity");
class MongooseAccountRepository {
    constructor(role, model) {
        this.role = role;
        this.model = model;
    }
    async findById(id) {
        const document = (await this.model.findById(id).exec());
        return document ? this.toEntity(document) : null;
    }
    async findByEmail(email) {
        const document = (await this.model
            .findOne({ email: email.trim().toLowerCase() })
            .exec());
        return document ? this.toEntity(document) : null;
    }
    async findByResetTokenHash(resetTokenHash) {
        const document = (await this.model
            .findOne({ resetTokenHash })
            .exec());
        return document ? this.toEntity(document) : null;
    }
    async create(account) {
        const created = (await this.model.create(this.toPersistence(account)));
        return this.toEntity(created);
    }
    async save(account) {
        const updated = (await this.model
            .findByIdAndUpdate(account.getId(), this.toPersistence(account), { new: true })
            .exec());
        if (!updated) {
            throw new Error("Failed to save account.");
        }
        return this.toEntity(updated);
    }
    toEntity(document) {
        return account_entity_1.AccountEntity.create({
            id: document._id.toString(),
            role: this.role,
            email: document.email,
            passwordHash: document.passwordHash,
            status: document.status,
            isFirstLogin: document.isFirstLogin,
            organizationId: document.organizationId?.toString(),
            comptypeId: document.comptypeId?.toString(),
            firstName: document.firstName,
            lastName: document.lastName,
            fullName: document.fullName,
            designation: document.designation,
            phone: document.phone,
            branch: document.branch,
            cgpa: document.cgpa,
            rollNumber: document.rollNumber,
            refreshTokenHash: document.refreshTokenHash,
            resetTokenHash: document.resetTokenHash,
            resetTokenExpiresAt: document.resetTokenExpiresAt,
        });
    }
    toPersistence(account) {
        const props = account.toPersistence();
        return {
            email: props.email,
            passwordHash: props.passwordHash,
            status: props.status,
            isFirstLogin: props.isFirstLogin,
            organizationId: props.organizationId,
            comptypeId: props.comptypeId,
            firstName: props.firstName,
            lastName: props.lastName,
            fullName: props.fullName,
            designation: props.designation,
            phone: props.phone,
            branch: props.branch,
            cgpa: props.cgpa,
            rollNumber: props.rollNumber,
            refreshTokenHash: props.refreshTokenHash,
            resetTokenHash: props.resetTokenHash,
            resetTokenExpiresAt: props.resetTokenExpiresAt,
        };
    }
}
exports.MongooseAccountRepository = MongooseAccountRepository;
