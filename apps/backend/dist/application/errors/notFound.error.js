"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotFoundError = void 0;
// src/shared/errors/NotFoundError.ts
const AppError_1 = require("./AppError");
const HttpStatus_enum_1 = require("@domain/enums/HttpStatus.enum");
const ErrorCodes_enum_1 = require("@domain/enums/ErrorCodes.enum");
class NotFoundError extends AppError_1.AppError {
    constructor(resource) {
        super(`${resource} not found`, HttpStatus_enum_1.HttpStatus.NOT_FOUND, ErrorCodes_enum_1.ErrorCode.NOT_FOUND);
    }
}
exports.NotFoundError = NotFoundError;
