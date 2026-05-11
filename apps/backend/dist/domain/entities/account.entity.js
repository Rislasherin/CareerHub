"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountEntity = void 0;
const account_status_enum_1 = require("@domain/enums/account-status.enum");
class AccountEntity {
    constructor(props) {
        this.props = props;
    }
    static create(props) {
        return new AccountEntity(props);
    }
    getId() {
        if (!this.props.id) {
            throw new Error("Account id is missing.");
        }
        return this.props.id;
    }
    getRole() {
        return this.props.role;
    }
    getEmail() {
        return this.props.email;
    }
    getPasswordHash() {
        return this.props.passwordHash;
    }
    setPasswordHash(passwordHash) {
        this.props.passwordHash = passwordHash;
    }
    getStatus() {
        return this.props.status;
    }
    isBlocked() {
        return this.props.status === account_status_enum_1.AccountStatus.BLOCKED;
    }
    isFirstLogin() {
        return this.props.isFirstLogin;
    }
    completeFirstLogin() {
        this.props.isFirstLogin = false;
    }
    getOrganizationId() {
        return this.props.organizationId;
    }
    getCompanyId() {
        return this.props.companyId;
    }
    getFirstName() {
        return this.props.firstName;
    }
    getLastName() {
        return this.props.lastName;
    }
    getFullName() {
        return this.props.fullName;
    }
    getDesignation() {
        return this.props.designation;
    }
    getPhone() {
        return this.props.phone;
    }
    getBranch() {
        return this.props.branch;
    }
    getCgpa() {
        return this.props.cgpa;
    }
    getRollNumber() {
        return this.props.rollNumber;
    }
    getRefreshTokenHash() {
        return this.props.refreshTokenHash;
    }
    setRefreshTokenHash(refreshTokenHash) {
        this.props.refreshTokenHash = refreshTokenHash;
    }
    getResetTokenHash() {
        return this.props.resetTokenHash;
    }
    getResetTokenExpiresAt() {
        return this.props.resetTokenExpiresAt;
    }
    setResetToken(resetTokenHash, resetTokenExpiresAt) {
        this.props.resetTokenHash = resetTokenHash;
        this.props.resetTokenExpiresAt = resetTokenExpiresAt;
    }
    clearResetToken() {
        this.props.resetTokenHash = undefined;
        this.props.resetTokenExpiresAt = undefined;
    }
    toPersistence() {
        return { ...this.props };
    }
}
exports.AccountEntity = AccountEntity;
