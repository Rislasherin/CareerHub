"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
require("./load.env");
const zod_1 = require("zod");
const envSchema = zod_1.z.object({
    PORT: zod_1.z.string().transform(Number),
    NODE_ENV: zod_1.z.enum(["development", "production", "test"]).default("development"),
    CLIENT_URL: zod_1.z.string().default("http://localhost:3000"),
    MONGODB_URI: zod_1.z.string().nonempty("MONGODB_URI is required"),
    JWT_ACCESS_SECRET: zod_1.z.string().nonempty("JWT_ACCESS_SECRET is required"),
    JWT_ACCESS_EXPIRES_IN: zod_1.z.string(),
    JWT_REFRESH_SECRET: zod_1.z.string().nonempty("JWT_REFRESH_SECRET is required"),
    JWT_REFRESH_EXPIRES_IN: zod_1.z.string(),
    COOKIE_MAX_AGE_MS: zod_1.z.string().transform(Number).default("1800000"),
    EMAIL_HOST: zod_1.z.string().nonempty("EMAIL_HOST is required"),
    EMAIL_PORT: zod_1.z.string().transform(Number),
    EMAIL_USER: zod_1.z.string().nonempty("EMAIL_USER is required"),
    EMAIL_PASS: zod_1.z.string().nonempty("EMAIL_PASS is required"),
    EMAIL_FROM: zod_1.z.string().default("CareerHub <no-reply@careerhub.com>"),
    FRONTEND_URL: zod_1.z.string().default("http://localhost:3000"),
});
exports.env = envSchema.parse(process.env);
