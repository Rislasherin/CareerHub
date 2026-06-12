"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.comptypeSchema = void 0;
const mongoose_1 = require("mongoose");
exports.comptypeSchema = new mongoose_1.Schema({
    name: { type: String, required: true, unique: true, trim: true },
    size: { type: String, required: true, trim: true },
    industry: { type: String, required: true, trim: true },
    primaryContactName: { type: String, required: true, trim: true },
    primaryContactEmail: { type: String, required: true, trim: true, lowercase: true },
    primaryContactPhone: { type: String, required: true, trim: true },
}, { timestamps: true });
