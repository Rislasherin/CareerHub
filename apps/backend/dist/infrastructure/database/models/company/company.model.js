"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComptypeModel = void 0;
const mongoose_1 = require("mongoose");
const comptype_schema_1 = require("@infrastructure/database/schema/comptype/comptype.schema");
exports.ComptypeModel = mongoose_1.models.Comptype || (0, mongoose_1.model)("Comptype", comptype_schema_1.ComptypeSchema);
