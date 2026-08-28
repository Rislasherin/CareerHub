import { IRequestCollegeEmailChangeUseCase } from "../interfaces/IRequestCollegeEmailChange.usecase";
import { RequestEmailChangeDto } from "@application/dtos/hr/settings/hr-settings.dto";
import { ICollegeAdminRepository } from "@domain/repositories/ICollegeAdminRepository";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { IOtpRepository } from "@domain/repositories/IOtpRepository";
import { IEmailService } from "@application/services/IEmailService";
import { CrossRoleAuthService } from "@application/services/CrossRoleAuthService";

export class RequestCollegeEmailChangeUseCase implements IRequestCollegeEmailChangeUseCase {
  constructor(
    private readonly _collegeAdminRepository: ICollegeAdminRepository,
    private readonly _otpRepository: IOtpRepository,
    private readonly _emailService: IEmailService,
    private readonly _crossRoleAuthService: CrossRoleAuthService
  ) {}

  async execute(adminId: string, dto: RequestEmailChangeDto): Promise<void> {
    const admin = await this._collegeAdminRepository.findById(adminId);
    if (!admin) {
      throw new AppError("College Administrator not found", HttpStatus.NOT_FOUND, ErrorCode.USER_NOT_FOUND);
    }

    const newEmail = dto.newEmail.toLowerCase().trim();

    if (admin.email === newEmail) {
      throw new AppError("New email must be different from current email", HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
    }

    // Check if new email is in use globally
    const globalCheck = await this._crossRoleAuthService.isEmailInUse(newEmail);
    if (globalCheck.inUse) {
      throw new AppError(`Email is already in use by a ${globalCheck.role}`, HttpStatus.CONFLICT, ErrorCode.USER_ALREADY_EXISTS);
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`[College Settings] Verification OTP for ${newEmail}: ${otp}`);

    // Save to OTP repo
    await this._otpRepository.deleteByEmail(newEmail);
    await this._otpRepository.create(newEmail, otp);

    // Send email
    await this._emailService.sendOTP(newEmail, otp, "CareerHub Account Settings");
  }
}
