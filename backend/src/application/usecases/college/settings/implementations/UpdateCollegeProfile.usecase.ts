import { IUpdateCollegeProfileUseCase } from "../interfaces/IUpdateCollegeProfile.usecase";
import { UpdateCollegeProfileRequestDto } from "@application/dtos/college/settings/college-settings.dto";
import { IOrganizationRepository } from "@domain/repositories/IOrganizationRepository";
import { ICollegeAdminRepository } from "@domain/repositories/ICollegeAdminRepository";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { Organization } from "@domain/entities/Organization";
import { CollegeAdmin } from "@domain/entities/CollegeAdmin";

export class UpdateCollegeProfileUseCase implements IUpdateCollegeProfileUseCase {
  constructor(
    private readonly _organizationRepository: IOrganizationRepository,
    private readonly _collegeAdminRepository: ICollegeAdminRepository
  ) {}

  async execute(orgId: string, adminId: string, dto: UpdateCollegeProfileRequestDto): Promise<void> {
    const org = await this._organizationRepository.findById(orgId);
    if (!org) {
      throw new AppError("Institution not found", HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }

    const admin = await this._collegeAdminRepository.findById(adminId);
    if (!admin) {
      throw new AppError("College Administrator not found", HttpStatus.NOT_FOUND, ErrorCode.USER_NOT_FOUND);
    }

    // Verify uniqueness of organization name if it is changed
    if (dto.name && dto.name !== org.name) {
      const existingOrg = await this._organizationRepository.findByName(dto.name);
      if (existingOrg) {
        throw new AppError("Institution name already exists", HttpStatus.CONFLICT, ErrorCode.RESOURCE_EXISTS);
      }
    }

    // Update organization properties (Mass assignment protection)
    const orgProps = org.toJSON();
    orgProps.name = dto.name;
    orgProps.placementContactPhone = dto.phone;
    orgProps.website = dto.website;
    orgProps.instituteType = dto.instituteType;
    orgProps.address = dto.address;

    await this._organizationRepository.update(orgId, Organization.create(orgProps));

    // Update college admin names
    const parts = dto.organizerName.trim().split(" ");
    const firstName = parts[0] || "";
    const lastName = parts.slice(1).join(" ") || "";

    const adminProps = admin.toJSON();
    adminProps.firstName = firstName;
    adminProps.lastName = lastName;

    await this._collegeAdminRepository.update(adminId, CollegeAdmin.create(adminProps));
  }
}
