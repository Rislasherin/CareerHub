import { IOrganizationRepository } from "@domain/repositories/IOrganizationRepository";
import { Organization } from "@domain/entities/Organization";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";

import { IUpdateOrganizationPlanUseCase } from "./interfaces/IUpdateOrganizationPlan.usecase";

export class UpdateOrganizationPlanUseCase implements IUpdateOrganizationPlanUseCase {
  constructor(
    private readonly orgRepo: IOrganizationRepository
  ) {}

  async execute(id: string, plan: string): Promise<void> {
    const org = await this.orgRepo.findById(id);
    if (!org) {
      throw new AppError("Organization not found", HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }

    const updatedOrg = Organization.create({
      ...org.toJSON(),
      plan
    });

    await this.orgRepo.update(id, updatedOrg);
  }
}
