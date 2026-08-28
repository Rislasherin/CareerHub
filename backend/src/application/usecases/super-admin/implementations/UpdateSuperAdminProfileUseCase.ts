import { IUpdateSuperAdminProfileUseCase } from "../interfaces/IUpdateSuperAdminProfileUseCase.usecase";
import { ISuperAdminRepository } from "@domain/repositories/ISuperAdminRepository";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { SuperAdmin } from "@domain/entities/SuperAdmin";

export class UpdateSuperAdminProfileUseCase implements IUpdateSuperAdminProfileUseCase {
  constructor(private readonly _superAdminRepository: ISuperAdminRepository) {}

  async execute(id: string, data: { firstName?: string; lastName?: string }): Promise<any> {
    const admin = await this._superAdminRepository.findById(id);
    if (!admin) {
      throw new AppError("Super Admin not found", HttpStatus.NOT_FOUND, ErrorCode.USER_NOT_FOUND);
    }

    const updatedProps = admin.toJSON();
    if (data.firstName !== undefined) updatedProps.firstName = data.firstName;
    if (data.lastName !== undefined) updatedProps.lastName = data.lastName;

    // Strict whitelisting - we do not map other fields here
    const updatedEntity = await this._superAdminRepository.update(id, SuperAdmin.create(updatedProps));
    const { password, ...adminWithoutPassword } = updatedEntity.toJSON();
    return adminWithoutPassword;
  }
}
