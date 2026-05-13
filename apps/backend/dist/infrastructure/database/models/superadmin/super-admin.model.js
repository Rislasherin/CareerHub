"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuperAdminModel = void 0;
const mongoose_1 = require("mongoose");
const super_admin_schema_1 = require("@infrastructure/database/schema/superadmin/super-admin.schema");
exports.SuperAdminModel = mongoose_1.models.SuperAdmin || (0, mongoose_1.model)("SuperAdmin", super_admin_schema_1.SuperAdminSchema);
