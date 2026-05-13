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
    status: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
});
