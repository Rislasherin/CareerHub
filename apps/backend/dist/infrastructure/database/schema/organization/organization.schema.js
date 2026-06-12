"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.organizationSchema = void 0;
const mongoose_1 = require("mongoose");
exports.organizationSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    city: {
        type: String,
        required: true,
    },
    state: {
        type: String,
        required: false,
        trim: true,
    },
    studentCountRange: {
        type: String,
        required: false,
    },
    shortName: { type: String, required: false },
    yearEstablished: { type: String, required: false },
    address: { type: String, required: false },
    naacGrade: { type: String, required: false },
    placementCellName: { type: String, required: false },
    placementContactEmail: { type: String, required: false },
    placementContactPhone: { type: String, required: false },
    activeBranches: [{ type: String }],
    currentAcademicYear: { type: String, required: false },
    activePlacementBatch: { type: String, required: false },
    plan: { type: String, required: false },
    logoUrl: { type: String, required: false },
    onboardingStep: { type: Number, default: 0 },
    website: { type: String, required: false },
    status: {
        type: String,
        required: true,
    },
    blockedBy: { type: String, required: false },
    isDeleted: { type: Boolean, default: false, index: true },
}, {
    timestamps: true,
});
