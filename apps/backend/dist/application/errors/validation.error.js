"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationError = void 0;
const AppError_1 = require("@application/errors/AppError");
const ErrorCodes_enum_1 = require("@domain/enums/ErrorCodes.enum");
const HttpStatus_enum_1 = require("@domain/enums/HttpStatus.enum");
class ValidationError extends AppError_1.AppError {
    constructor(message) {
        super(message, HttpStatus_enum_1.HttpStatus.BAD_REQUEST, ErrorCodes_enum_1.ErrorCode.VALIDATION_ERROR);
    }
}
exports.ValidationError = ValidationError;
