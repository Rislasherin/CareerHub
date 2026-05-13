"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanySchema = void 0;
const mongoose_1 = require("mongoose");
exports.CompanySchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    sector: {
        type: String,
        required: false,
        trim: true,
    },
    size: {
        type: String,
        required: false,
    },
    location: {
        type: String,
        required: false,
    },
    contactName: {
        type: String,
        required: false,
    },
    contactEmail: {
        type: String,
        required: false,
    },
    contactPhone: {
        type: String,
        required: false,
    },
    onboardingStep: {
        type: Number,
        default: 1,
    },
    status: {
        type: String,
        enum: ["active", "inactive", "pending"],
        default: "pending",
    },
}, {
    timestamps: true,
});
