import { IOrganizationRepository } from "@domain/repositories/IOrganizationRepository";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { MESSAGES } from "@shared/constants/messages.constants";

export class ExtendCollegeTrialUseCase {
  constructor(private readonly orgRepo: IOrganizationRepository) {}

  async execute(orgId: string, days: number): Promise<void> {
    const org = await this.orgRepo.findById(orgId);
    if (!org) {
      throw new AppError(MESSAGES.ERROR.NOT_FOUND, HttpStatus.NOT_FOUND, ErrorCode.INTERNAL_ERROR);
    }
    await this.orgRepo.extendTrial(orgId, days);
  }
}
