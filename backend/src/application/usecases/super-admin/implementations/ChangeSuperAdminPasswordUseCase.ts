import { IChangeSuperAdminPasswordUseCase } from "../interfaces/IChangeSuperAdminPasswordUseCase.usecase";
import { ISuperAdminRepository } from "@domain/repositories/ISuperAdminRepository";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { IBcryptService } from "@application/interfaces/IBcryptService";
import { SuperAdmin } from "@domain/entities/SuperAdmin";
import { ChangePasswordRequestDto } from "@application/dtos/hr/settings/hr-settings.dto";

export class ChangeSuperAdminPasswordUseCase implements IChangeSuperAdminPasswordUseCase {
  constructor(
    private readonly _superAdminRepository: ISuperAdminRepository,
    private readonly _bcryptService: IBcryptService
  ) {}

  async execute(id: string, dto: ChangePasswordRequestDto): Promise<void> {
    const admin = await this._superAdminRepository.findById(id);
    if (!admin) {
      throw new AppError("Super Admin not found", HttpStatus.NOT_FOUND, ErrorCode.USER_NOT_FOUND);
    }

    const isPasswordValid = await this._bcryptService.compare(dto.currentPassword, admin.password);
    if (!isPasswordValid) {
      throw new AppError("Incorrect current password", HttpStatus.BAD_REQUEST, ErrorCode.INVALID_CREDENTIALS);
    }

    if (dto.newPassword === dto.currentPassword) {
      throw new AppError("New password must be different from current password", HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
    }

    const hashedNewPassword = await this._bcryptService.hash(dto.newPassword);
    const updatedProps = admin.toJSON();
    updatedProps.password = hashedNewPassword;

    await this._superAdminRepository.update(id, SuperAdmin.create(updatedProps));
  }
}
