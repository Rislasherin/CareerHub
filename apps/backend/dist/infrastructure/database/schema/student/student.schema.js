"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.studentSchema = void 0;
const mongoose_1 = require("mongoose");
const user_status_enum_1 = require("@domain/enums/user.status.enum");
exports.studentSchema = new mongoose_1.Schema({
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: false }, // Password optional initially during invite
    status: { type: String, enum: Object.values(user_status_enum_1.UserStatus), default: user_status_enum_1.UserStatus.PENDING_INVITE },
    collegeId: { type: String, required: true },
    proofUrl: { type: String, required: false },
    rollNumber: { type: String, required: false },
    department: { type: String, required: false },
    phoneNumber: { type: String, required: false },
    invitationToken: { type: String, required: false },
    invitationExpiresAt: { type: Date, required: false },
    isFirstLogin: { type: Boolean, default: true },
}, { timestamps: true });
