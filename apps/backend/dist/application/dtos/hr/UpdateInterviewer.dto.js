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
exports.UpdateInterviewerDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class UpdateInterviewerDto {
}
exports.UpdateInterviewerDto = UpdateInterviewerDto;
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MinLength)(2, { message: 'First name must be at least 2 characters' }),
    (0, class_validator_1.MaxLength)(50, { message: 'First name cannot exceed 50 characters' }),
    (0, class_validator_1.Matches)(/^[A-Z]/, { message: 'First name must start with a capital letter' }),
    __metadata("design:type", String)
], UpdateInterviewerDto.prototype, "firstName", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MinLength)(1, { message: 'Last name must be at least 1 character' }),
    (0, class_validator_1.MaxLength)(50, { message: 'Last name cannot exceed 50 characters' }),
    (0, class_validator_1.Matches)(/^[A-Z]/, { message: 'Last name must start with a capital letter' }),
    __metadata("design:type", String)
], UpdateInterviewerDto.prototype, "lastName", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateInterviewerDto.prototype, "designation", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateInterviewerDto.prototype, "specialization", void 0);
