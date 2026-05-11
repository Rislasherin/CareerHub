"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CGPA = void 0;
class CGPA {
    constructor(value) {
        this.value = value;
    }
    static create(value) {
        if (value < 0 || value > 10) {
            throw new Error("CGPA must be between 0 and 10");
        }
        return new CGPA(value);
    }
    getValue() {
        return this.value;
    }
}
exports.CGPA = CGPA;
