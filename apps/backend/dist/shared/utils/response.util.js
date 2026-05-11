"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSuccess = void 0;
const HttpStatus_enum_1 = require("@domain/enums/HttpStatus.enum");
const sendSuccess = (res, data, message = "Success", statusCode = HttpStatus_enum_1.HttpStatus.OK) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
    });
};
exports.sendSuccess = sendSuccess;
