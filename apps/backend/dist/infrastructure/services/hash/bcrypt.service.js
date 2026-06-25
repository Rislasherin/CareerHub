"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BcryptService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
class BcryptService {
    constructor() {
        this._SALT_ROUNDS = 10;
    }
    async hash(password) {
        return bcrypt_1.default.hash(password, this._SALT_ROUNDS);
    }
    async compare(plain, hash) {
        return bcrypt_1.default.compare(plain, hash);
    }
}
exports.BcryptService = BcryptService;
