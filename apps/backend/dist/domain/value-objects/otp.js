"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Otp = void 0;
class Otp {
    constructor(hash, expiry, attempts = 0) {
        this.hash = hash;
        this.expiry = expiry;
        this.attempts = attempts;
    }
    isExpired() {
        return new Date() > this.expiry;
    }
    incrementAttempts() {
        this.attempts++;
    }
    isMaxAttemptsReached() {
        return this.attempts >= 3;
    }
    clear() {
        return null;
    }
    getHash() {
        return this.hash;
    }
    getExpiry() {
        return this.expiry;
    }
}
exports.Otp = Otp;
