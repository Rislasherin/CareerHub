"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HrUserModel = void 0;
const mongoose_1 = require("mongoose");
const hr_user_schema_1 = require("@infrastructure/database/schema/hr-user.schema");
exports.HrUserModel = (0, mongoose_1.model)("HrUser", hr_user_schema_1.hrUserSchema);
