import { IGetCollegeProfileUseCase, CollegeProfileResponse } from "../interfaces/IGetCollegeProfile.usecase";
import { IOrganizationRepository } from "@domain/repositories/IOrganizationRepository";
import { ICollegeAdminRepository } from "@domain/repositories/ICollegeAdminRepository";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";

export class GetCollegeProfileUseCase implements IGetCollegeProfileUseCase {
  constructor(
    private readonly _organizationRepository: IOrganizationRepository,
    private readonly _collegeAdminRepository: ICollegeAdminRepository
  ) {}

  async execute(orgId: string, adminId: string): Promise<CollegeProfileResponse> {
    const org = await this._organizationRepository.findById(orgId);
    if (!org) {
      throw new AppError("Institution not found", HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }

    const admin = await this._collegeAdminRepository.findById(adminId);
    if (!admin) {
      throw new AppError("College Administrator not found", HttpStatus.NOT_FOUND, ErrorCode.USER_NOT_FOUND);
    }

    return {
      name: org.name,
      organizerName: `${admin.firstName} ${admin.lastName}`.trim(),
      email: admin.email,
      phone: org.placementContactPhone,
      website: org.website,
      instituteType: org.instituteType,
      address: org.address
    };
  }
}
