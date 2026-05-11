"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordHash = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
class PasswordHash {
    constructor(value) {
        this.value = value;
    }
    // DB il ninn varumbo
    static fromHash(hash) {
        return new PasswordHash(hash);
    }
    // signup / first set
    static async createFromPlain(password) {
        const hash = await bcrypt_1.default.hash(password, 10);
        return new PasswordHash(hash);
    }
    // 🔥 compare
    async compare(plain) {
        return bcrypt_1.default.compare(plain, this.value);
    }
    getValue() {
        return this.value;
    }
}
exports.PasswordHash = PasswordHash;
