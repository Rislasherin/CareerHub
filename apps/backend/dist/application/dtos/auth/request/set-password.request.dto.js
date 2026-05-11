"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setPasswordRequestSchema = void 0;
const zod_1 = require("zod");
exports.setPasswordRequestSchema = zod_1.z.object({
    token: zod_1.z.string().min(12),
    password: zod_1.z.string().min(8),
});
