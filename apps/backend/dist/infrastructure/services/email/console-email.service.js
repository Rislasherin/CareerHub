"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsoleEmailService = void 0;
const logger_1 = require("@infrastructure/logger/logger");
class ConsoleEmailService {
    async send(input) {
        logger_1.logger.info(`Email queued for ${input.to}: ${input.subject}`);
    }
}
exports.ConsoleEmailService = ConsoleEmailService;
