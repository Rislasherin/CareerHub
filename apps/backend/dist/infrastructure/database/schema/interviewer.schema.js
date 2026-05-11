"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.interviewerSchema = void 0;
const mongoose_1 = require("mongoose");
const shared_schema_1 = require("@infrastructure/database/schema/shared.schema");
exports.interviewerSchema = new mongoose_1.Schema({
    ...shared_schema_1.authStateFields,
    companyId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Company",
        required: true,
        index: true,
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
    },
    designation: {
        type: String,
        required: true,
        trim: true,
    },
    phone: {
        type: String,
        required: false,
        trim: true,
    },
}, shared_schema_1.baseSchemaOptions);
