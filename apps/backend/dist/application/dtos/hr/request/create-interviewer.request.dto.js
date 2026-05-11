"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInterviewerRequestSchema = void 0;
const zod_1 = require("zod");
exports.createInterviewerRequestSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(2),
    lastName: zod_1.z.string().min(1),
    email: zod_1.z.string().email(),
    phone: zod_1.z.string().min(10).optional(),
    designation: zod_1.z.string().min(2),
    employeeId: zod_1.z.string().min(2).optional(),
});
