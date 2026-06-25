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
exports.AddInterviewerDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class AddInterviewerDto {
}
exports.AddInterviewerDto = AddInterviewerDto;
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(2, { message: 'First name must be at least 2 characters' }),
    (0, class_validator_1.MaxLength)(50, { message: 'First name cannot exceed 50 characters' }),
    (0, class_validator_1.Matches)(/^[A-Z]/, { message: 'First name must start with a capital letter' }),
    (0, class_validator_1.Matches)(/^[a-zA-Z ]+$/, { message: 'First name can only contain letters and spaces' }),
    __metadata("design:type", String)
], AddInterviewerDto.prototype, "firstName", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(1, { message: 'Last name must be at least 1 character' }),
    (0, class_validator_1.MaxLength)(50, { message: 'Last name cannot exceed 50 characters' }),
    (0, class_validator_1.Matches)(/^[A-Z]/, { message: 'Last name must start with a capital letter' }),
    (0, class_validator_1.Matches)(/^[a-zA-Z ]+$/, { message: 'Last name can only contain letters and spaces' }),
    __metadata("design:type", String)
], AddInterviewerDto.prototype, "lastName", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Matches)(/^(?!.*\s\s)/, { message: "Email cannot have consecutive spaces" }),
    (0, class_validator_1.Matches)(/^(?!.*\s$)/, { message: "Email cannot end with a space" }),
    (0, class_validator_1.Matches)(/^(?!^\s)/, { message: "Email cannot start with a space" }),
    (0, class_validator_1.Matches)(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/, { message: 'Invalid email address' }),
    __metadata("design:type", String)
], AddInterviewerDto.prototype, "email", void 0);
