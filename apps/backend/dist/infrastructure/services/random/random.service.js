"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RandomService = void 0;
const crypto_1 = require("crypto");
class RandomService {
    generateToken(length = 48) {
        return (0, crypto_1.randomBytes)(Math.ceil(length / 2)).toString("hex").slice(0, length);
    }
    generateTemporaryPassword(length = 12) {
        return this.generateToken(length);
    }
}
exports.RandomService = RandomService;
