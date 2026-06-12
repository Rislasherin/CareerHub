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
exports.UpdateComptypeOnboardingDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class UpdateComptypeOnboardingDto {
}
exports.UpdateComptypeOnboardingDto = UpdateComptypeOnboardingDto;
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MinLength)(2, { message: "Comptype name must be at least 2 characters long" }),
    (0, class_validator_1.MaxLength)(100, { message: "Comptype name cannot exceed 100 characters" }),
    __metadata("design:type", String)
], UpdateComptypeOnboardingDto.prototype, "name", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(255, { message: "Website URL cannot exceed 255 characters" }),
    __metadata("design:type", String)
], UpdateComptypeOnboardingDto.prototype, "website", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(100, { message: "Industry cannot exceed 100 characters" }),
    __metadata("design:type", String)
], UpdateComptypeOnboardingDto.prototype, "industry", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(200, { message: "Headquarters location cannot exceed 200 characters" }),
    __metadata("design:type", String)
], UpdateComptypeOnboardingDto.prototype, "headquarters", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(1000, { message: "Description cannot exceed 1000 characters" }),
    __metadata("design:type", String)
], UpdateComptypeOnboardingDto.prototype, "description", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(50, { message: "Comptype size string cannot exceed 50 characters" }),
    __metadata("design:type", String)
], UpdateComptypeOnboardingDto.prototype, "size", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MinLength)(2, { message: "Contact name must be at least 2 characters long" }),
    (0, class_validator_1.MaxLength)(100, { message: "Contact name cannot exceed 100 characters" }),
    __metadata("design:type", String)
], UpdateComptypeOnboardingDto.prototype, "contactName", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(100, { message: "Job title cannot exceed 100 characters" }),
    __metadata("design:type", String)
], UpdateComptypeOnboardingDto.prototype, "jobTitle", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsEmail)({}, { message: "Please provide a valid contact email" }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateComptypeOnboardingDto.prototype, "contactEmail", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MinLength)(8, { message: "Contact phone must be at least 8 digits" }),
    (0, class_validator_1.MaxLength)(20, { message: "Contact phone cannot exceed 20 digits" }),
    (0, class_validator_1.Matches)(/^\+?[0-9\s\-]+$/, { message: "Please enter a valid contact phone number" }),
    __metadata("design:type", String)
], UpdateComptypeOnboardingDto.prototype, "contactPhone", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], UpdateComptypeOnboardingDto.prototype, "preferredColleges", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(2000, { message: "Logo URL cannot exceed 2000 characters" }),
    __metadata("design:type", String)
], UpdateComptypeOnboardingDto.prototype, "logoUrl", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsNotEmpty)({ message: "Step is required" }),
    __metadata("design:type", Number)
], UpdateComptypeOnboardingDto.prototype, "step", void 0);
