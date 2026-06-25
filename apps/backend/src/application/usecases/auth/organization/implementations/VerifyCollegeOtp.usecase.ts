import { IOtpRepository } from "@domain/repositories/IOtpRepository";
import { IOrganizationRepository } from "@domain/repositories/IOrganizationRepository";
import { ICollegeAdminRepository } from "@domain/repositories/ICollegeAdminRepository";
import { IJwtService } from "@application/interfaces/IJwt.service";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { Role } from "@domain/enums/Roles.enum";
import { UserStatus } from "@domain/enums/user.status.enum";
import { VerifyCollegeOtpRequestDto } from "@application/dtos/auth/collage/Request/VerifyCollegeOtpRequest.dto";

import { IVerifyCollegeOtpUseCase } from "../interfaces/IVerifyCollegeOtp.usecase";

export class VerifyCollegeOtpUseCase implements IVerifyCollegeOtpUseCase {
  constructor(
    private readonly _otpRepository: IOtpRepository,
    private readonly _collegeAdminRepository: ICollegeAdminRepository,
    private readonly _organizationRepository: IOrganizationRepository,
    private readonly _jwtService: IJwtService
  ) {}

  async execute(dto: VerifyCollegeOtpRequestDto) {
    const validOtp = await this._otpRepository.findByEmailAndOtp(dto.email, dto.otp);
    
    if (!validOtp) {
      throw new AppError("Invalid or expired OTP", HttpStatus.BAD_REQUEST, ErrorCode.INVALID_CREDENTIALS);
    }

    // Activate the College Admin and Organization
    const collegeAdmin = await this._collegeAdminRepository.findByEmail(dto.email);
    if (!collegeAdmin) {
      throw new AppError("Admin not found", HttpStatus.NOT_FOUND, ErrorCode.USER_NOT_FOUND);
    }

    const organization = await this._organizationRepository.findById(collegeAdmin.orgId);
    if (!organization) {
      throw new AppError("Organization not found", HttpStatus.NOT_FOUND, ErrorCode.USER_NOT_FOUND);
    }

    // Activate to pending onboarding state
    collegeAdmin.status = UserStatus.PENDING;
    await this._collegeAdminRepository.update(collegeAdmin.id!, collegeAdmin);

    organization.status = UserStatus.PENDING;
    await this._organizationRepository.update(organization.id!, organization);

    // Delete OTP after successful verification
    await this._otpRepository.deleteByEmail(dto.email);

    // Generate Tokens
    const payload = {
        id: collegeAdmin.id!,
        role: Role.COLLEGE_ADMIN,
        orgId: organization.id!,
    };

    const accessToken = this._jwtService.signAccessToken(payload);
    const refreshToken = this._jwtService.signRefreshToken(payload);

    return {
      accessToken,
      refreshToken,
      collegeAdmin: {
        id: collegeAdmin.id,
        firstName: collegeAdmin.firstName,
        lastName: collegeAdmin.lastName,
        email: collegeAdmin.email,
        role: collegeAdmin.role,
        status: collegeAdmin.status,
        orgId: collegeAdmin.orgId
      },
      organization: organization.toJSON(),
    };
  }
}
