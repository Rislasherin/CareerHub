"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenExpiredCustomError = exports.TokenInvalidError = exports.InvalidCredentialsError = exports.UnauthorizedError = void 0;
const AppError_1 = require("@application/errors/AppError");
const ErrorCodes_enum_1 = require("@domain/enums/ErrorCodes.enum");
const HttpStatus_enum_1 = require("@domain/enums/HttpStatus.enum");
class UnauthorizedError extends AppError_1.AppError {
    constructor(message = "Unauthorized") {
        super(message, HttpStatus_enum_1.HttpStatus.UNAUTHORIZED, ErrorCodes_enum_1.ErrorCode.UNAUTHORIZED);
    }
}
exports.UnauthorizedError = UnauthorizedError;
class InvalidCredentialsError extends AppError_1.AppError {
    constructor() {
        super("Invalid email or password", HttpStatus_enum_1.HttpStatus.UNAUTHORIZED, ErrorCodes_enum_1.ErrorCode.INVALID_CREDENTIALS);
    }
}
exports.InvalidCredentialsError = InvalidCredentialsError;
class TokenInvalidError extends AppError_1.AppError {
    constructor() {
        super("Token is invalid", HttpStatus_enum_1.HttpStatus.UNAUTHORIZED, ErrorCodes_enum_1.ErrorCode.TOKEN_INVALID);
    }
}
exports.TokenInvalidError = TokenInvalidError;
class TokenExpiredCustomError extends AppError_1.AppError {
    constructor() {
        super("Token has expired", HttpStatus_enum_1.HttpStatus.UNAUTHORIZED, ErrorCodes_enum_1.ErrorCode.TOKEN_EXPIRED);
    }
}
exports.TokenExpiredCustomError = TokenExpiredCustomError;
