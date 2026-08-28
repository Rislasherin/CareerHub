import { IChangeCollegePasswordUseCase } from "../interfaces/IChangeCollegePassword.usecase";
import { ChangePasswordRequestDto } from "@application/dtos/hr/settings/hr-settings.dto";
import { ICollegeAdminRepository } from "@domain/repositories/ICollegeAdminRepository";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { IBcryptService } from "@application/interfaces/IBcryptService";
import { CollegeAdmin } from "@domain/entities/CollegeAdmin";

export class ChangeCollegePasswordUseCase implements IChangeCollegePasswordUseCase {
  constructor(
    private readonly _collegeAdminRepository: ICollegeAdminRepository,
    private readonly _bcryptService: IBcryptService
  ) {}

  async execute(adminId: string, dto: ChangePasswordRequestDto): Promise<void> {
    const admin = await this._collegeAdminRepository.findById(adminId);
    if (!admin) {
      throw new AppError("College Administrator not found", HttpStatus.NOT_FOUND, ErrorCode.USER_NOT_FOUND);
    }

    const isPasswordValid = await this._bcryptService.compare(dto.currentPassword, admin.password);
    if (!isPasswordValid) {
      throw new AppError("Incorrect current password", HttpStatus.BAD_REQUEST, ErrorCode.INVALID_CREDENTIALS);
    }

    const hashedNewPassword = await this._bcryptService.hash(dto.newPassword);

    const adminProps = admin.toJSON();
    adminProps.password = hashedNewPassword;

    await this._collegeAdminRepository.update(adminId, CollegeAdmin.create(adminProps));
  }
}
