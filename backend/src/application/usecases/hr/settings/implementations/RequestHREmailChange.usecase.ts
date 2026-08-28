import { IHRUserRepository } from "@domain/repositories/IHRUserRepository";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { IOtpRepository } from "@domain/repositories/IOtpRepository";
import { IEmailService } from "@application/services/IEmailService";
import { RequestEmailChangeDto } from "@application/dtos/hr/settings/hr-settings.dto";

export interface IRequestHREmailChangeUseCase {
  execute(hrUserId: string, dto: RequestEmailChangeDto): Promise<void>;
}

export class RequestHREmailChangeUseCase implements IRequestHREmailChangeUseCase {
  constructor(
    private readonly _hrUserRepository: IHRUserRepository,
    private readonly _otpRepository: IOtpRepository,
    private readonly _emailService: IEmailService
  ) {}

  async execute(hrUserId: string, dto: RequestEmailChangeDto) {
    const hrUser = await this._hrUserRepository.findById(hrUserId);
    
    if (!hrUser) {
      throw new AppError("HR User not found", HttpStatus.NOT_FOUND, ErrorCode.USER_NOT_FOUND);
    }

    if (hrUser.email === dto.newEmail) {
      throw new AppError("New email must be different from current email", HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
    }

    // Check if new email is already in use by another user
    const existingUser = await this._hrUserRepository.findByEmail(dto.newEmail);
    if (existingUser) {
      throw new AppError("Email is already in use", HttpStatus.CONFLICT, ErrorCode.USER_ALREADY_EXISTS);
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`[HR Settings] Verification OTP for ${dto.newEmail}: ${otp}`);

    // Save to OTP repo
    await this._otpRepository.deleteByEmail(dto.newEmail); // clear any existing for this email
    await this._otpRepository.create(dto.newEmail, otp);

    // Send email
    await this._emailService.sendOTP(dto.newEmail, otp, "CareerHub Account Settings");
  }
}
