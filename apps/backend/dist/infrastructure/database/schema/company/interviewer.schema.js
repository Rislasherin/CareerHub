"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InterviewerSchema = void 0;
const mongoose_1 = require("mongoose");
exports.InterviewerSchema = new mongoose_1.Schema({
    comptypeId: {
        type: String,
        required: true,
    },
    firstName: {
        type: String,
        required: true,
        trim: true,
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    designation: {
        type: String,
        required: true,
    },
    specialization: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
    },
    blockedBy: { type: String, required: false },
    isDeleted: { type: Boolean, default: false, index: true },
}, {
    timestamps: true,
});
