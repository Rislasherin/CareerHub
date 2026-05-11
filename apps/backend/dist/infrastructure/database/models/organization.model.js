"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationModel = void 0;
const mongoose_1 = require("mongoose");
const organization_schema_1 = require("@infrastructure/database/schema/organization.schema");
exports.OrganizationModel = (0, mongoose_1.model)("Organization", organization_schema_1.organizationSchema);
