"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hrUserSchema = void 0;
const mongoose_1 = require("mongoose");
const shared_schema_1 = require("@infrastructure/database/schema/shared.schema");
exports.hrUserSchema = new mongoose_1.Schema({
    ...shared_schema_1.authStateFields,
    comptypeId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Comptype",
        required: true,
        index: true,
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
    designation: {
        type: String,
        required: true,
        trim: true,
    },
}, shared_schema_1.baseSchemaOptions);
