"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.accountSchema = void 0;
const mongoose_1 = require("mongoose");
const Roles_enum_1 = require("@domain/enums/Roles.enum");
const account_status_enum_1 = require("@domain/enums/account.status.enum");
exports.accountSchema = new mongoose_1.Schema({
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: Object.values(Roles_enum_1.Role), required: true },
    status: { type: String, enum: Object.values(account_status_enum_1.AccountStatus), required: true, default: account_status_enum_1.AccountStatus.INVITED },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    organizationId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Organization" },
    companyId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Company" },
    department: { type: String, trim: true },
    designation: { type: String, trim: true },
    rollNumber: { type: String, trim: true },
    employeeId: { type: String, trim: true },
    inviteTokenHash: { type: String },
    inviteExpiresAt: { type: Date },
    resetOtpHash: { type: String },
    resetOtpExpiresAt: { type: Date },
    refreshTokenHash: { type: String },
    mustChangePassword: { type: Boolean, default: true },
}, {
    timestamps: true,
});
