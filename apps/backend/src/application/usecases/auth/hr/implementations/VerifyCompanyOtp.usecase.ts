import { IOtpRepository } from "@domain/repositories/IOtpRepository";
import { ICompanyRepository } from "@domain/repositories/ICompanyRepository";
import { IHRUserRepository } from "@domain/repositories/IHRUserRepository";
import { IJwtService } from "@application/interfaces/IJwt.service";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { Role } from "@domain/enums/Roles.enum";
import { UserStatus } from "@domain/enums/user.status.enum";
import { VerifyCompanyOtpRequestDto } from "@application/dtos/auth/hr/Request/VerifyCompanyOtpRequest.dto";

export class VerifyCompanyOtpUseCase {
  constructor(
    private readonly _otpRepository: IOtpRepository,
    private readonly _hrUserRepository: IHRUserRepository,
    private readonly _companyRepository: ICompanyRepository,
    private readonly _jwtService: IJwtService
  ) {}

  async execute(dto: VerifyCompanyOtpRequestDto) {
    const validOtp = await this._otpRepository.findByEmailAndOtp(dto.email, dto.otp);
    
    if (!validOtp) {
      throw new AppError("Invalid or expired OTP", HttpStatus.BAD_REQUEST, ErrorCode.INVALID_CREDENTIALS);
    }

    // OTP is valid. Now activate the HR User and Company
    const hrUser = await this._hrUserRepository.findByEmail(dto.email);
    if (!hrUser) {
      throw new AppError("User not found", HttpStatus.NOT_FOUND, ErrorCode.USER_NOT_FOUND);
    }

    const company = await this._companyRepository.findById(hrUser.companyId);
    if (!company) {
      throw new AppError("Company not found", HttpStatus.NOT_FOUND, ErrorCode.USER_NOT_FOUND);
    }

    // Activate to pending onboarding state
    hrUser.status = UserStatus.PENDING;
    await this._hrUserRepository.update(hrUser.id!, hrUser);

    company.status = UserStatus.PENDING;
    await this._companyRepository.update(company.id!, company);

    // Delete OTP after successful verification
    await this._otpRepository.deleteByEmail(dto.email);

    // Generate Tokens
    const payload = {
        id: hrUser.id!,
        role: Role.HR,
        companyId: company.id!,
    };

    const accessToken = this._jwtService.signAccessToken(payload);
    const refreshToken = this._jwtService.signRefreshToken(payload);

    return {
      accessToken,
      refreshToken,
      company: company.toJSON(),
      hrUser: {
        id: hrUser.id,
        firstName: hrUser.firstName,
        lastName: hrUser.lastName,
        email: hrUser.email,
        role: hrUser.role,
      },
    };
  }
}
