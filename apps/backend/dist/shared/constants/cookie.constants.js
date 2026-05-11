"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.REFRESH_COOKIE_OPTIONS = exports.COOKIE_NAMES = void 0;
const env_validator_1 = require("@infrastructure/config/env.validator");
const isProduction = env_validator_1.env.NODE_ENV === "production";
exports.COOKIE_NAMES = {
    REFRESH_TOKEN: "careerhub_refresh_token",
};
exports.REFRESH_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    path: "/api/auth",
    maxAge: env_validator_1.env.REFRESH_COOKIE_MAX_AGE_MS,
};
