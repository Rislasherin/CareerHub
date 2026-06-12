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
exports.UpdateCollegeOnboardingDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class UpdateCollegeOnboardingDto {
}
exports.UpdateCollegeOnboardingDto = UpdateCollegeOnboardingDto;
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsNotEmpty)({ message: "Step is required" }),
    (0, class_validator_1.IsNumber)({}, { message: "Step must be a number" }),
    (0, class_validator_1.Matches)(/^[1-3]$/, { message: "Step must be a number between 1 and 3" }),
    __metadata("design:type", Number)
], UpdateCollegeOnboardingDto.prototype, "step", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MinLength)(3, { message: "College name must be at least 3 characters long" }),
    (0, class_validator_1.MaxLength)(150, { message: "College name cannot exceed 150 characters" }),
    (0, class_validator_1.Matches)(/^[A-Z]/, { message: "College name must start with a capital letter" }),
    (0, class_validator_1.Matches)(/^[a-zA-Z ]+$/, { message: "College name can only contain letters and spaces" }),
    (0, class_validator_1.Matches)(/^(?!.*\s\s)/, { message: "College name cannot have consecutive spaces" }),
    (0, class_validator_1.Matches)(/^(?!.*\s$)/, { message: "College name cannot end with a space" }),
    (0, class_validator_1.Matches)(/^(?!^\s)/, { message: "College name cannot start with a space" }),
    __metadata("design:type", String)
], UpdateCollegeOnboardingDto.prototype, "name", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MinLength)(2, { message: "Short name must be at least 2 characters long" }),
    (0, class_validator_1.MaxLength)(15, { message: "Short name cannot exceed 15 characters" }),
    (0, class_validator_1.Matches)(/^[A-Z]/, { message: "Short name must start with a capital letter" }),
    (0, class_validator_1.Matches)(/^[a-zA-Z ]+$/, { message: "Short name can only contain letters and spaces" }),
    (0, class_validator_1.Matches)(/^(?!.*\s\s)/, { message: "Short name cannot have consecutive spaces" }),
    (0, class_validator_1.Matches)(/^(?!.*\s$)/, { message: "Short name cannot end with a space" }),
    (0, class_validator_1.Matches)(/^(?!^\s)/, { message: "Short name cannot start with a space" }),
    __metadata("design:type", String)
], UpdateCollegeOnboardingDto.prototype, "shortName", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Matches)(/^\d{4}$/, { message: "Year established must be a 4-digit number" }),
    __metadata("design:type", String)
], UpdateCollegeOnboardingDto.prototype, "yearEstablished", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Matches)(/^(?!.*\s\s)/, { message: "Website URL cannot have consecutive spaces" }),
    (0, class_validator_1.Matches)(/^(?!.*\s$)/, { message: "Website URL cannot end with a space" }),
    (0, class_validator_1.Matches)(/^(?!^\s)/, { message: "Website URL cannot start with a space" }),
    (0, class_validator_1.MaxLength)(255, { message: "Website URL cannot exceed 255 characters" }),
    __metadata("design:type", String)
], UpdateCollegeOnboardingDto.prototype, "website", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Matches)(/^(?!.*\s\s)/, { message: "Address cannot have consecutive spaces" }),
    (0, class_validator_1.Matches)(/^(?!.*\s$)/, { message: "Address cannot end with a space" }),
    (0, class_validator_1.Matches)(/^(?!^\s)/, { message: "Address cannot start with a space" }),
    (0, class_validator_1.MaxLength)(500, { message: "Address cannot exceed 500 characters" }),
    __metadata("design:type", String)
], UpdateCollegeOnboardingDto.prototype, "address", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(5, { message: "NAAC grade cannot exceed 5 characters" }),
    (0, class_validator_1.Matches)(/^(?!.*\s\s)/, { message: "NAAC grade cannot have consecutive spaces" }),
    (0, class_validator_1.Matches)(/^(?!.*\s$)/, { message: "NAAC grade cannot end with a space" }),
    (0, class_validator_1.Matches)(/^(?!^\s)/, { message: "NAAC grade cannot start with a space" }),
    __metadata("design:type", String)
], UpdateCollegeOnboardingDto.prototype, "naacGrade", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Matches)(/^(?!.*\s\s)/, { message: "Placement cell name cannot have consecutive spaces" }),
    (0, class_validator_1.Matches)(/^(?!.*\s$)/, { message: "Placement cell name cannot end with a space" }),
    (0, class_validator_1.Matches)(/^(?!^\s)/, { message: "Placement cell name cannot start with a space" }),
    (0, class_validator_1.MaxLength)(100, { message: "Placement cell name cannot exceed 100 characters" }),
    __metadata("design:type", String)
], UpdateCollegeOnboardingDto.prototype, "placementCellName", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsEmail)({}, { message: "Please provide a valid placement contact email" }),
    (0, class_validator_1.Matches)(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/, { message: "Invalid email address" }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateCollegeOnboardingDto.prototype, "placementContactEmail", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MinLength)(8, { message: "Placement contact phone must be at least 8 digits" }),
    (0, class_validator_1.MaxLength)(20, { message: "Placement contact phone cannot exceed 20 digits" }),
    (0, class_validator_1.Matches)(/^\+?[0-9\s\-]+$/, { message: "Please enter a valid placement contact phone number" }),
    __metadata("design:type", String)
], UpdateCollegeOnboardingDto.prototype, "placementContactPhone", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Matches)(/^(?!.*\s\s)/, { message: "Logo URL cannot have consecutive spaces" }),
    (0, class_validator_1.Matches)(/^(?!.*\s$)/, { message: "Logo URL cannot end with a space" }),
    (0, class_validator_1.Matches)(/^(?!^\s)/, { message: "Logo URL cannot start with a space" }),
    (0, class_validator_1.MaxLength)(2000, { message: "Logo URL cannot exceed 2000 characters" }),
    __metadata("design:type", String)
], UpdateCollegeOnboardingDto.prototype, "logoUrl", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Matches)(/^(?!.*\s\s)/, { message: "Branch name cannot have consecutive spaces" }),
    (0, class_validator_1.Matches)(/^(?!.*\s$)/, { message: "Branch name cannot end with a space" }),
    (0, class_validator_1.Matches)(/^(?!^\s)/, { message: "Branch name cannot start with a space" }),
    (0, class_validator_1.MaxLength)(100, { message: "Branch name cannot exceed 100 characters" }),
    __metadata("design:type", Array)
], UpdateCollegeOnboardingDto.prototype, "activeBranches", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Matches)(/^(?!.*\s\s)/, { message: "Current academic year cannot have consecutive spaces" }),
    (0, class_validator_1.Matches)(/^(?!.*\s$)/, { message: "Current academic year cannot end with a space" }),
    (0, class_validator_1.Matches)(/^(?!^\s)/, { message: "Current academic year cannot start with a space" }),
    (0, class_validator_1.MaxLength)(20, { message: "Current academic year cannot exceed 20 characters" }),
    (0, class_validator_1.Matches)(/^(?!\d{4}$)/, { message: "Current academic year cannot be a 4-digit number" }),
    __metadata("design:type", String)
], UpdateCollegeOnboardingDto.prototype, "currentAcademicYear", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Matches)(/^(?!\d{4}$)/, { message: "Active placement batch cannot be a 4-digit number" }),
    (0, class_validator_1.Matches)(/^(?!.*\s\s)/, { message: "Active placement batch cannot have consecutive spaces" }),
    (0, class_validator_1.Matches)(/^(?!.*\s$)/, { message: "Active placement batch cannot end with a space" }),
    (0, class_validator_1.Matches)(/^(?!^\s)/, { message: "Active placement batch cannot start with a space" }),
    (0, class_validator_1.MaxLength)(20, { message: "Active placement batch cannot exceed 20 characters" }),
    __metadata("design:type", String)
], UpdateCollegeOnboardingDto.prototype, "activePlacementBatch", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(50, { message: "Plan cannot exceed 50 characters" }),
    (0, class_validator_1.Matches)(/^(?![a-zA-Z]$)/, { message: "Plan cannot be a single letter" }),
    __metadata("design:type", String)
], UpdateCollegeOnboardingDto.prototype, "plan", void 0);
