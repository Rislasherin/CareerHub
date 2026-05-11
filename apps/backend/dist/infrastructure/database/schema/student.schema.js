"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.studentSchema = void 0;
const mongoose_1 = require("mongoose");
const shared_schema_1 = require("@infrastructure/database/schema/shared.schema");
exports.studentSchema = new mongoose_1.Schema({
    ...shared_schema_1.authStateFields,
    organizationId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Organization",
        required: true,
        index: true,
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
    },
    rollNumber: {
        type: String,
        required: true,
        trim: true,
    },
    branch: {
        type: String,
        required: true,
        trim: true,
    },
    cgpa: {
        type: Number,
        required: true,
        min: 0,
        max: 10,
    },
}, shared_schema_1.baseSchemaOptions);
