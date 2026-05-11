"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollegeAdminModel = void 0;
const mongoose_1 = require("mongoose");
const college_admin_schema_1 = require("@infrastructure/database/schema/college-admin.schema");
exports.CollegeAdminModel = (0, mongoose_1.model)("CollegeAdmin", college_admin_schema_1.collegeAdminSchema);
