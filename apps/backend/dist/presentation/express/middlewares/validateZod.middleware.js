"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateZod = void 0;
const validation_error_1 = require("@application/errors/validation.error");
const validateZod = (schema) => (req, _res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
        const message = result.error.issues.map((issue) => issue.message).join(", ");
        throw new validation_error_1.ValidationError(message);
    }
    req.body = result.data;
    next();
};
exports.validateZod = validateZod;
