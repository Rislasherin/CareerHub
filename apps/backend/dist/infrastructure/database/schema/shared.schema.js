"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.baseSchemaOptions = exports.authStateFields = void 0;
const account_status_enum_1 = require("@domain/enums/account-status.enum");
exports.authStateFields = {
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        index: true,
    },
    passwordHash: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: Object.values(account_status_enum_1.AccountStatus),
        default: account_status_enum_1.AccountStatus.ACTIVE,
    },
    isFirstLogin: {
        type: Boolean,
        default: false,
    },
    refreshTokenHash: {
        type: String,
        required: false,
    },
    resetTokenHash: {
        type: String,
        required: false,
        index: true,
    },
    resetTokenExpiresAt: {
        type: Date,
        required: false,
    },
};
exports.baseSchemaOptions = {
    timestamps: true,
};
