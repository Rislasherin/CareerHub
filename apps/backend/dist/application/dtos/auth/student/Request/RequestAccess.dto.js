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
exports.RequestAccessDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class RequestAccessDto {
}
exports.RequestAccessDto = RequestAccessDto;
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'First name is required' }),
    (0, class_validator_1.MinLength)(2, { message: 'First name must be at least 2 characters long' }),
    (0, class_validator_1.MaxLength)(50, { message: 'First name cannot exceed 50 characters' }),
    __metadata("design:type", String)
], RequestAccessDto.prototype, "firstName", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Last name is required' }),
    (0, class_validator_1.MinLength)(1, { message: 'Last name must be at least 1 character long' }),
    (0, class_validator_1.MaxLength)(50, { message: 'Last name cannot exceed 50 characters' }),
    __metadata("design:type", String)
], RequestAccessDto.prototype, "lastName", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Roll number is required' }),
    (0, class_validator_1.MinLength)(3, { message: 'Roll number must be at least 3 characters long' }),
    (0, class_validator_1.MaxLength)(30, { message: 'Roll number cannot exceed 30 characters' }),
    __metadata("design:type", String)
], RequestAccessDto.prototype, "rollNumber", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Department is required' }),
    (0, class_validator_1.MinLength)(2, { message: 'Department name must be at least 2 characters long' }),
    (0, class_validator_1.MaxLength)(100, { message: 'Department name cannot exceed 100 characters' }),
    __metadata("design:type", String)
], RequestAccessDto.prototype, "department", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsEmail)({}, { message: 'Please provide a valid email address' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Email address is required' }),
    __metadata("design:type", String)
], RequestAccessDto.prototype, "email", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Phone number is required' }),
    (0, class_validator_1.MinLength)(8, { message: 'Phone number must be at least 8 digits' }),
    (0, class_validator_1.MaxLength)(20, { message: 'Phone number cannot exceed 20 digits' }),
    (0, class_validator_1.Matches)(/^\+?[0-9\s\-]+$/, { message: 'Please enter a valid phone number' }),
    __metadata("design:type", String)
], RequestAccessDto.prototype, "phoneNumber", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'College ID is required' }),
    (0, class_validator_1.MaxLength)(100, { message: 'College ID cannot exceed 100 characters' }),
    __metadata("design:type", String)
], RequestAccessDto.prototype, "collegeId", void 0);
