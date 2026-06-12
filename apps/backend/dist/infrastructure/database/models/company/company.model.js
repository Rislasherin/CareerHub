"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyModel = void 0;
const mongoose_1 = require("mongoose");
const company_schema_1 = require("@infrastructure/database/schema/company/company.schema");
exports.CompanyModel = mongoose_1.models.Company || (0, mongoose_1.model)("Company", company_schema_1.CompanySchema);
