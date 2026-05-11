"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const validation_error_1 = require("@application/errors/validation.error");
const validateDto = (dtoClass) => {
    return async (req, _res, next) => {
        const dto = (0, class_transformer_1.plainToInstance)(dtoClass, req.body, {
            excludeExtraneousValues: true,
        });
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            const messages = errors
                .map((error) => Object.values(error.constraints || {}))
                .flat()
                .join(", ");
            return next(new validation_error_1.ValidationError(messages));
        }
        req.body = dto;
        next();
    };
};
exports.validateDto = validateDto;
