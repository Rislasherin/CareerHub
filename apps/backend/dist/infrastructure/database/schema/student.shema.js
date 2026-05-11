"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.studentSchema = void 0;
const mongoose_1 = require("mongoose");
const user_status_enum_1 = require("@domain/enums/user.status.enum");
exports.studentSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    status: { type: String, enum: Object.values(user_status_enum_1.UserStatus), default: user_status_enum_1.UserStatus.ACTIVE },
    collegeId: { type: String },
    isFirstLogin: { type: Boolean, default: false },
}, { timestamps: true });
