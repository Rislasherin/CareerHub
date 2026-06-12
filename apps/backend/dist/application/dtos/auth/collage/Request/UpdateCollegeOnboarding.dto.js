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
    __metadata("design:type", Number)
], UpdateCollegeOnboardingDto.prototype, "step", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MinLength)(3, { message: "College name must be at least 3 characters long" }),
    (0, class_validator_1.MaxLength)(150, { message: "College name cannot exceed 150 characters" }),
    __metadata("design:type", String)
], UpdateCollegeOnboardingDto.prototype, "name", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MinLength)(2, { message: "Short name must be at least 2 characters long" }),
    (0, class_validator_1.MaxLength)(15, { message: "Short name cannot exceed 15 characters" }),
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
    (0, class_validator_1.MaxLength)(255, { message: "Website URL cannot exceed 255 characters" }),
    __metadata("design:type", String)
], UpdateCollegeOnboardingDto.prototype, "website", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(500, { message: "Address cannot exceed 500 characters" }),
    __metadata("design:type", String)
], UpdateCollegeOnboardingDto.prototype, "address", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(5, { message: "NAAC grade cannot exceed 5 characters" }),
    __metadata("design:type", String)
], UpdateCollegeOnboardingDto.prototype, "naacGrade", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(100, { message: "Placement cell name cannot exceed 100 characters" }),
    __metadata("design:type", String)
], UpdateCollegeOnboardingDto.prototype, "placementCellName", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsEmail)({}, { message: "Please provide a valid placement contact email" }),
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
    (0, class_validator_1.MaxLength)(2000, { message: "Logo URL cannot exceed 2000 characters" }),
    __metadata("design:type", String)
], UpdateCollegeOnboardingDto.prototype, "logoUrl", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], UpdateCollegeOnboardingDto.prototype, "activeBranches", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(20, { message: "Current academic year cannot exceed 20 characters" }),
    __metadata("design:type", String)
], UpdateCollegeOnboardingDto.prototype, "currentAcademicYear", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(20, { message: "Active placement batch cannot exceed 20 characters" }),
    __metadata("design:type", String)
], UpdateCollegeOnboardingDto.prototype, "activePlacementBatch", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(50, { message: "Plan cannot exceed 50 characters" }),
    __metadata("design:type", String)
], UpdateCollegeOnboardingDto.prototype, "plan", void 0);
