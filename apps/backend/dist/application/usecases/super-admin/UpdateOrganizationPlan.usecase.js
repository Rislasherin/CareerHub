"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateOrganizationPlanUseCase = void 0;
const Organization_1 = require("@domain/entities/Organization");
const AppError_1 = require("@application/errors/AppError");
const HttpStatus_enum_1 = require("@domain/enums/HttpStatus.enum");
const ErrorCodes_enum_1 = require("@domain/enums/ErrorCodes.enum");
class UpdateOrganizationPlanUseCase {
    constructor(orgRepo) {
        this.orgRepo = orgRepo;
    }
    async execute(id, plan) {
        const org = await this.orgRepo.findById(id);
        if (!org) {
            throw new AppError_1.AppError("Organization not found", HttpStatus_enum_1.HttpStatus.NOT_FOUND, ErrorCodes_enum_1.ErrorCode.NOT_FOUND);
        }
        const updatedOrg = Organization_1.Organization.create({
            ...org.toJSON(),
            plan
        });
        await this.orgRepo.update(id, updatedOrg);
    }
}
exports.UpdateOrganizationPlanUseCase = UpdateOrganizationPlanUseCase;
