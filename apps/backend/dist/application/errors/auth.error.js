"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidCredentialsError = exports.ForbiddenError = exports.UnauthorizedError = void 0;
const app_error_1 = require("@application/errors/app.error");
const http_status_constants_1 = require("@shared/constants/http-status.constants");
const message_constants_1 = require("@shared/constants/message.constants");
class UnauthorizedError extends app_error_1.AppError {
    constructor(message = message_constants_1.MESSAGE_CONSTANTS.COMMON.UNAUTHORIZED) {
        super(message, http_status_constants_1.HTTP_STATUS.UNAUTHORIZED, "UNAUTHORIZED");
    }
}
exports.UnauthorizedError = UnauthorizedError;
class ForbiddenError extends app_error_1.AppError {
    constructor(message = message_constants_1.MESSAGE_CONSTANTS.COMMON.FORBIDDEN) {
        super(message, http_status_constants_1.HTTP_STATUS.FORBIDDEN, "FORBIDDEN");
    }
}
exports.ForbiddenError = ForbiddenError;
class InvalidCredentialsError extends app_error_1.AppError {
    constructor() {
        super(message_constants_1.MESSAGE_CONSTANTS.AUTH.INVALID_CREDENTIALS, http_status_constants_1.HTTP_STATUS.UNAUTHORIZED, "INVALID_CREDENTIALS");
    }
}
exports.InvalidCredentialsError = InvalidCredentialsError;
