"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.organizationSchema = void 0;
const mongoose_1 = require("mongoose");
exports.organizationSchema = new mongoose_1.Schema({
    name: { type: String, required: true, unique: true, trim: true },
    shortName: { type: String, required: true, trim: true },
    collegeType: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    website: { type: String, required: false, trim: true },
    placementCellName: { type: String, required: false, trim: true },
    activeBatch: { type: String, required: false, trim: true },
    naacGrade: { type: String, required: false, trim: true },
}, { timestamps: true });
