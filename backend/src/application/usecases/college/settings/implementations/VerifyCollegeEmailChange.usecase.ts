import { IVerifyCollegeEmailChangeUseCase } from "../interfaces/IVerifyCollegeEmailChange.usecase";
import { VerifyEmailChangeDto } from "@application/dtos/hr/settings/hr-settings.dto";
import { ICollegeAdminRepository } from "@domain/repositories/ICollegeAdminRepository";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { IOtpRepository } from "@domain/repositories/IOtpRepository";
import { CrossRoleAuthService } from "@application/services/CrossRoleAuthService";
import { CollegeAdmin } from "@domain/entities/CollegeAdmin";

export class VerifyCollegeEmailChangeUseCase implements IVerifyCollegeEmailChangeUseCase {
  constructor(
    private readonly _collegeAdminRepository: ICollegeAdminRepository,
    private readonly _otpRepository: IOtpRepository,
    private readonly _crossRoleAuthService: CrossRoleAuthService
  ) {}

  async execute(adminId: string, dto: VerifyEmailChangeDto): Promise<void> {
    const admin = await this._collegeAdminRepository.findById(adminId);
    if (!admin) {
      throw new AppError("College Administrator not found", HttpStatus.NOT_FOUND, ErrorCode.USER_NOT_FOUND);
    }

    const email = dto.email.toLowerCase().trim();

    const validOtp = await this._otpRepository.findByEmailAndOtp(email, dto.otp);
    if (!validOtp) {
      throw new AppError("Invalid or expired OTP", HttpStatus.BAD_REQUEST, ErrorCode.INVALID_CREDENTIALS);
    }

    // Double check email availability globally
    const globalCheck = await this._crossRoleAuthService.isEmailInUse(email);
    if (globalCheck.inUse) {
      throw new AppError(`Email is already in use by a ${globalCheck.role}`, HttpStatus.CONFLICT, ErrorCode.USER_ALREADY_EXISTS);
    }

    // Update Email
    const adminProps = admin.toJSON();
    adminProps.email = email;

    await this._collegeAdminRepository.update(adminId, CollegeAdmin.create(adminProps));

    // Cleanup OTP
    await this._otpRepository.deleteByEmail(email);
  }
}
