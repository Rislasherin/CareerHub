import { IHRUserRepository } from "@domain/repositories/IHRUserRepository";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { IOtpRepository } from "@domain/repositories/IOtpRepository";
import { VerifyEmailChangeDto } from "@application/dtos/hr/settings/hr-settings.dto";
import { HRUser } from "@domain/entities/HRUser";

export interface IVerifyHREmailChangeUseCase {
  execute(hrUserId: string, dto: VerifyEmailChangeDto): Promise<void>;
}

export class VerifyHREmailChangeUseCase implements IVerifyHREmailChangeUseCase {
  constructor(
    private readonly _hrUserRepository: IHRUserRepository,
    private readonly _otpRepository: IOtpRepository
  ) {}

  async execute(hrUserId: string, dto: VerifyEmailChangeDto) {
    const hrUser = await this._hrUserRepository.findById(hrUserId);
    
    if (!hrUser) {
      throw new AppError("HR User not found", HttpStatus.NOT_FOUND, ErrorCode.USER_NOT_FOUND);
    }

    const validOtp = await this._otpRepository.findByEmailAndOtp(dto.email, dto.otp);
    if (!validOtp) {
      throw new AppError("Invalid or expired OTP", HttpStatus.BAD_REQUEST, ErrorCode.INVALID_CREDENTIALS);
    }

    // Verify uniqueness again just in case it was taken between request and verify
    const existingUser = await this._hrUserRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new AppError("Email is already in use", HttpStatus.CONFLICT, ErrorCode.USER_ALREADY_EXISTS);
    }

    // Update email
    const updatedProps = hrUser.toJSON();
    updatedProps.email = dto.email;

    await this._hrUserRepository.update(hrUserId, HRUser.create(updatedProps));

    // Clean up OTP
    await this._otpRepository.deleteByEmail(dto.email);
  }
}
