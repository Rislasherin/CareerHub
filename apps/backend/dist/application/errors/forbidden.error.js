"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForbiddenError = void 0;
// src/shared/errors/ForbiddenError.ts
const AppError_1 = require("./AppError");
const HttpStatus_enum_1 = require("@domain/enums/HttpStatus.enum");
const ErrorCodes_enum_1 = require("@domain/enums/ErrorCodes.enum");
class ForbiddenError extends AppError_1.AppError {
    constructor(message = 'Access denied') {
        super(message, HttpStatus_enum_1.HttpStatus.FORBIDDEN, ErrorCodes_enum_1.ErrorCode.FORBIDDEN);
    }
}
exports.ForbiddenError = ForbiddenError;
