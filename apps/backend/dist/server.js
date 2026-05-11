"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const connect_1 = require("@infrastructure/database/mongoose/connect");
const env_validator_1 = require("@infrastructure/config/env.validator");
const logger_1 = require("@infrastructure/logger/logger");
const startServer = async () => {
    await (0, connect_1.connectDB)();
    app_1.default.listen(env_validator_1.env.PORT, () => {
        logger_1.logger.info(`Server running on http://localhost:${env_validator_1.env.PORT}`);
    });
};
startServer();
