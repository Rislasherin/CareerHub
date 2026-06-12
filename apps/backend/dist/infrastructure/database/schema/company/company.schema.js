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
    website: { type: String, required: false },
    logoUrl: { type: String, required: false },
    industry: { type: String, required: false },
    headquarters: { type: String, required: false },
    description: { type: String, required: false },
    contactJobTitle: { type: String, required: false },
    preferredColleges: [{ type: String }],
    onboardingStep: {
        type: Number,
        default: 0,
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
