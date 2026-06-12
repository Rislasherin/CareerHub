"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterStudentRequestDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class RegisterStudentRequestDto {
}
exports.RegisterStudentRequestDto = RegisterStudentRequestDto;
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: "First name is required" }),
    (0, class_validator_1.MinLength)(2, { message: "First name must be at least 2 characters long" }),
    (0, class_validator_1.MaxLength)(50, { message: "First name cannot exceed 50 characters" }),
    __metadata("design:type", String)
], RegisterStudentRequestDto.prototype, "firstName", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: "Last name is required" }),
    (0, class_validator_1.MinLength)(1, { message: "Last name must be at least 1 character long" }),
    (0, class_validator_1.MaxLength)(50, { message: "Last name cannot exceed 50 characters" }),
    __metadata("design:type", String)
], RegisterStudentRequestDto.prototype, "lastName", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsEmail)({}, { message: "Please provide a valid email address" }),
    __metadata("design:type", String)
], RegisterStudentRequestDto.prototype, "email", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(6, { message: "Password must be at least 6 characters long" }),
    (0, class_validator_1.MaxLength)(100, { message: "Password cannot exceed 100 characters" }),
    __metadata("design:type", String)
], RegisterStudentRequestDto.prototype, "password", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: "College ID is required" }),
    (0, class_validator_1.MaxLength)(100, { message: "College ID cannot exceed 100 characters" }),
    __metadata("design:type", String)
], RegisterStudentRequestDto.prototype, "collegeId", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: "Proof URL is required" }),
    (0, class_validator_1.MaxLength)(2000, { message: "Proof URL cannot exceed 2000 characters" }),
    __metadata("design:type", String)
], RegisterStudentRequestDto.prototype, "proofUrl", void 0);
