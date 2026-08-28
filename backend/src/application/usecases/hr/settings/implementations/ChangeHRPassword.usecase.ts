import { IHRUserRepository } from "@domain/repositories/IHRUserRepository";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { IBcryptService } from "@application/interfaces/IBcryptService";
import { ChangePasswordRequestDto } from "@application/dtos/hr/settings/hr-settings.dto";
import { HRUser } from "@domain/entities/HRUser";

export interface IChangeHRPasswordUseCase {
  execute(hrUserId: string, dto: ChangePasswordRequestDto): Promise<void>;
}

export class ChangeHRPasswordUseCase implements IChangeHRPasswordUseCase {
  constructor(
    private readonly _hrUserRepository: IHRUserRepository,
    private readonly _bcryptService: IBcryptService
  ) {}

  async execute(hrUserId: string, dto: ChangePasswordRequestDto) {
    const hrUser = await this._hrUserRepository.findById(hrUserId);
    
    if (!hrUser) {
      throw new AppError("HR User not found", HttpStatus.NOT_FOUND, ErrorCode.USER_NOT_FOUND);
    }

    const isPasswordValid = await this._bcryptService.compare(dto.currentPassword, hrUser.password);
    if (!isPasswordValid) {
      throw new AppError("Incorrect current password", HttpStatus.BAD_REQUEST, ErrorCode.INVALID_CREDENTIALS);
    }

    const newHashedPassword = await this._bcryptService.hash(dto.newPassword);
    
    const updatedProps = hrUser.toJSON();
    updatedProps.password = newHashedPassword;

    await this._hrUserRepository.update(hrUserId, HRUser.create(updatedProps));
  }
}
