"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JWT_REFRESH_EXPIRES_IN = exports.JWT_REFRESH_SECRET = exports.JWT_ACCESS_EXPIRES_IN = exports.JWT_ACCESS_SECRET = void 0;
const env_validator_1 = require("@infrastructure/config/env.validator");
exports.JWT_ACCESS_SECRET = env_validator_1.env.JWT_ACCESS_SECRET;
exports.JWT_ACCESS_EXPIRES_IN = env_validator_1.env.JWT_ACCESS_EXPIRES_IN;
exports.JWT_REFRESH_SECRET = env_validator_1.env.JWT_REFRESH_SECRET;
exports.JWT_REFRESH_EXPIRES_IN = env_validator_1.env.JWT_REFRESH_EXPIRES_IN;
