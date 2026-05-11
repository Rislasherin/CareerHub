"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = void 0;
const AppError_1 = require("@application/errors/AppError");
const HttpStatus_enum_1 = require("@domain/enums/HttpStatus.enum");
const ErrorCodes_enum_1 = require("@domain/enums/ErrorCodes.enum");
const logger_1 = require("@infrastructure/logger/logger");
const errorMiddleware = (err, _req, res, _next) => {
    if (err instanceof AppError_1.AppError) {
        logger_1.logger.warn(`[${err.errorCode}] ${err.message}`);
        return res.status(err.statusCode).json({
            success: false,
            error: {
                code: err.errorCode,
                message: err.message,
            },
        });
    }
    logger_1.logger.error("Unhandled error", err);
    return res.status(HttpStatus_enum_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
            code: ErrorCodes_enum_1.ErrorCode.INTERNAL_ERROR,
            message: "Something went wrong",
        },
    });
};
exports.errorMiddleware = errorMiddleware;
