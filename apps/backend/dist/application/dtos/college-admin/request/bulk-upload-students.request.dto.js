"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkUploadStudentsRequestSchema = void 0;
const zod_1 = require("zod");
exports.bulkUploadStudentsRequestSchema = zod_1.z.object({
    csvContent: zod_1.z.string().min(1),
});
