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
exports.UpdateCompanyOnboardingDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class UpdateCompanyOnboardingDto {
}
exports.UpdateCompanyOnboardingDto = UpdateCompanyOnboardingDto;
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MinLength)(2, { message: "Company name must be at least 2 characters long" }),
    (0, class_validator_1.MaxLength)(100, { message: "Company name cannot exceed 100 characters" }),
    (0, class_validator_1.Matches)(/^(?!.*\s\s)/, { message: "Company name cannot have consecutive spaces" }),
    (0, class_validator_1.Matches)(/^(?!.*\s$)/, { message: "Company name cannot end with a space" }),
    (0, class_validator_1.Matches)(/^(?!^\s)/, { message: "Company name cannot start with a space" }),
    (0, class_validator_1.Matches)(/^[a-zA-Z\s'-]+$/, { message: "Company name can only contain letters, spaces, hyphens, and apostrophes" }),
    __metadata("design:type", String)
], UpdateCompanyOnboardingDto.prototype, "name", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(255, { message: "Website URL cannot exceed 255 characters" }),
    (0, class_validator_1.Matches)(/^(?!.*\s\s)/, { message: "Website URL cannot have consecutive spaces" }),
    (0, class_validator_1.Matches)(/^(?!.*\s$)/, { message: "Website URL cannot end with a space" }),
    (0, class_validator_1.Matches)(/^(?!^\s)/, { message: "Website URL cannot start with a space" }),
    (0, class_validator_1.Matches)(/^[a-zA-Z\s'-]+$/, { message: "Website URL can only contain letters, spaces, hyphens, and apostrophes" }),
    __metadata("design:type", String)
], UpdateCompanyOnboardingDto.prototype, "website", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(100, { message: "Industry cannot exceed 100 characters" }),
    (0, class_validator_1.Matches)(/^(?!.*\s\s)/, { message: "Industry cannot have consecutive spaces" }),
    (0, class_validator_1.Matches)(/^(?!.*\s$)/, { message: "Industry cannot end with a space" }),
    (0, class_validator_1.Matches)(/^(?!^\s)/, { message: "Industry cannot start with a space" }),
    (0, class_validator_1.Matches)(/^[a-zA-Z\s'-]+$/, { message: "Industry can only contain letters, spaces, hyphens, and apostrophes" }),
    __metadata("design:type", String)
], UpdateCompanyOnboardingDto.prototype, "industry", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(200, { message: "Headquarters location cannot exceed 200 characters" }),
    (0, class_validator_1.Matches)(/^(?!.*\s\s)/, { message: "Headquarters location cannot have consecutive spaces" }),
    (0, class_validator_1.Matches)(/^(?!.*\s$)/, { message: "Headquarters location cannot end with a space" }),
    (0, class_validator_1.Matches)(/^(?!^\s)/, { message: "Headquarters location cannot start with a space" }),
    (0, class_validator_1.Matches)(/^[a-zA-Z\s'-]+$/, { message: "Headquarters location can only contain letters, spaces, hyphens, and apostrophes" }),
    __metadata("design:type", String)
], UpdateCompanyOnboardingDto.prototype, "headquarters", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(1000, { message: "Description cannot exceed 1000 characters" }),
    (0, class_validator_1.Matches)(/^(?!.*\s\s)/, { message: "Description cannot have consecutive spaces" }),
    (0, class_validator_1.Matches)(/^(?!.*\s$)/, { message: "Description cannot end with a space" }),
    (0, class_validator_1.Matches)(/^(?!^\s)/, { message: "Description cannot start with a space" }),
    (0, class_validator_1.Matches)(/^[a-zA-Z\s'-]+$/, { message: "Description can only contain letters, spaces, hyphens, and apostrophes" }),
    __metadata("design:type", String)
], UpdateCompanyOnboardingDto.prototype, "description", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(50, { message: "Company size string cannot exceed 50 characters" }),
    (0, class_validator_1.Matches)(/^(?!.*\s\s)/, { message: "Company size string cannot have consecutive spaces" }),
    (0, class_validator_1.Matches)(/^(?!.*\s$)/, { message: "Company size string cannot end with a space" }),
    (0, class_validator_1.Matches)(/^(?!^\s)/, { message: "Company size string cannot start with a space" }),
    (0, class_validator_1.Matches)(/^[a-zA-Z\s'-]+$/, { message: "Company size string can only contain letters, spaces, hyphens, and apostrophes" }),
    __metadata("design:type", String)
], UpdateCompanyOnboardingDto.prototype, "size", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MinLength)(2, { message: "Contact name must be at least 2 characters long" }),
    (0, class_validator_1.MaxLength)(100, { message: "Contact name cannot exceed 100 characters" }),
    (0, class_validator_1.Matches)(/^(?!.*\s\s)/, { message: "Contact name cannot have consecutive spaces" }),
    (0, class_validator_1.Matches)(/^(?!.*\s$)/, { message: "Contact name cannot end with a space" }),
    (0, class_validator_1.Matches)(/^(?!^\s)/, { message: "Contact name cannot start with a space" }),
    (0, class_validator_1.Matches)(/^[a-zA-Z\s'-]+$/, { message: "Contact name can only contain letters, spaces, hyphens, and apostrophes" }),
    __metadata("design:type", String)
], UpdateCompanyOnboardingDto.prototype, "contactName", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(100, { message: "Job title cannot exceed 100 characters" }),
    (0, class_validator_1.Matches)(/^(?!.*\s\s)/, { message: "Job title cannot have consecutive spaces" }),
    (0, class_validator_1.Matches)(/^(?!.*\s$)/, { message: "Job title cannot end with a space" }),
    (0, class_validator_1.Matches)(/^(?!^\s)/, { message: "Job title cannot start with a space" }),
    (0, class_validator_1.Matches)(/^[a-zA-Z\s'-]+$/, { message: "Job title can only contain letters, spaces, hyphens, and apostrophes" }),
    __metadata("design:type", String)
], UpdateCompanyOnboardingDto.prototype, "jobTitle", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsEmail)({}, { message: "Please provide a valid contact email" }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateCompanyOnboardingDto.prototype, "contactEmail", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MinLength)(8, { message: "Contact phone must be at least 8 digits" }),
    (0, class_validator_1.MaxLength)(20, { message: "Contact phone cannot exceed 20 digits" }),
    (0, class_validator_1.Matches)(/^\+?[0-9\s\-]+$/, { message: "Please enter a valid contact phone number" }),
    (0, class_validator_1.Matches)(/^(?!.*\s\s)/, { message: "Contact phone cannot have consecutive spaces" }),
    (0, class_validator_1.Matches)(/^(?!.*\s$)/, { message: "Contact phone cannot end with a space" }),
    (0, class_validator_1.Matches)(/^(?!^\s)/, { message: "Contact phone cannot start with a space" }),
    (0, class_validator_1.Matches)(/^[0-9\s\-]+$/, { message: "Contact phone can only contain numbers, spaces, and hyphens" }),
    __metadata("design:type", String)
], UpdateCompanyOnboardingDto.prototype, "contactPhone", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], UpdateCompanyOnboardingDto.prototype, "preferredColleges", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(2000, { message: "Logo URL cannot exceed 2000 characters" }),
    (0, class_validator_1.Matches)(/^(?!.*\s\s)/, { message: "Logo URL cannot have consecutive spaces" }),
    (0, class_validator_1.Matches)(/^(?!.*\s$)/, { message: "Logo URL cannot end with a space" }),
    (0, class_validator_1.Matches)(/^(?!^\s)/, { message: "Logo URL cannot start with a space" }),
    (0, class_validator_1.Matches)(/^[a-zA-Z\s'-]+$/, { message: "Logo URL can only contain letters, spaces, hyphens, and apostrophes" }),
    __metadata("design:type", String)
], UpdateCompanyOnboardingDto.prototype, "logoUrl", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsNotEmpty)({ message: "Step is required" }),
    __metadata("design:type", Number)
], UpdateCompanyOnboardingDto.prototype, "step", void 0);
