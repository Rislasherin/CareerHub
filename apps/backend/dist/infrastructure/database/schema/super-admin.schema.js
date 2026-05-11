"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.superAdminSchema = void 0;
const mongoose_1 = require("mongoose");
const shared_schema_1 = require("@infrastructure/database/schema/shared.schema");
exports.superAdminSchema = new mongoose_1.Schema({
    ...shared_schema_1.authStateFields,
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
    phone: {
        type: String,
        required: false,
        trim: true,
    },
}, shared_schema_1.baseSchemaOptions);
