"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HRUserModel = void 0;
const mongoose_1 = require("mongoose");
const hr_user_schema_1 = require("@infrastructure/database/schema/company/hr-user.schema");
exports.HRUserModel = mongoose_1.models.HRUser || (0, mongoose_1.model)("HRUser", hr_user_schema_1.HRUserSchema);
