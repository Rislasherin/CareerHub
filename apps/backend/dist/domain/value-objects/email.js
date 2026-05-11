"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Email = void 0;
class Email {
    constructor(value) {
        this.value = value;
    }
    static create(rawEmail) {
        const normalizedEmail = rawEmail.trim().toLowerCase();
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(normalizedEmail)) {
            throw new Error("Invalid email format.");
        }
        return new Email(normalizedEmail);
    }
    getValue() {
        return this.value;
    }
}
exports.Email = Email;
