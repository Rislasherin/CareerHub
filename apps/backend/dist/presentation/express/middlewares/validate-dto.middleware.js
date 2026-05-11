"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const validation_error_1 = require("@application/errors/validation.error");
const validateDto = (DtoClass) => async (request, _response, next) => {
    const dto = (0, class_transformer_1.plainToInstance)(DtoClass, request.body, {
        excludeExtraneousValues: true,
    });
    const errors = await (0, class_validator_1.validate)(dto, {
        whitelist: true,
        forbidNonWhitelisted: true,
    });
    if (errors.length > 0) {
        const message = errors
            .flatMap((error) => Object.values(error.constraints ?? {}))
            .join(", ");
        next(new validation_error_1.ValidationError(message));
        return;
    }
    request.body = dto;
    next();
};
exports.validateDto = validateDto;
