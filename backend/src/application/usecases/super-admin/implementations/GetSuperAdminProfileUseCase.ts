import { IGetSuperAdminProfileUseCase } from "../interfaces/IGetSuperAdminProfileUseCase.usecase";
import { ISuperAdminRepository } from "@domain/repositories/ISuperAdminRepository";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";

export class GetSuperAdminProfileUseCase implements IGetSuperAdminProfileUseCase {
  constructor(private readonly _superAdminRepository: ISuperAdminRepository) {}

  async execute(id: string): Promise<any> {
    const admin = await this._superAdminRepository.findById(id);
    if (!admin) {
      throw new AppError("Super Admin not found", HttpStatus.NOT_FOUND, ErrorCode.USER_NOT_FOUND);
    }
    const { password, ...adminWithoutPassword } = admin.toJSON();
    return adminWithoutPassword;
  }
}
