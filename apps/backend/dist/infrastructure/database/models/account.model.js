"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountModel = void 0;
const mongoose_1 = require("mongoose");
const account_schema_1 = require("@infrastructure/database/schema/account.schema");
exports.AccountModel = mongoose_1.models.Account || (0, mongoose_1.model)("Account", account_schema_1.accountSchema);
