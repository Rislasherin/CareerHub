"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyResetOtpRequestSchema = void 0;
const zod_1 = require("zod");
exports.verifyResetOtpRequestSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    otp: zod_1.z.string().length(6),
});
