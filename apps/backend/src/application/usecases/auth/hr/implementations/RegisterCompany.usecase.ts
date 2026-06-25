import { ICompanyRepository } from "@domain/repositories/ICompanyRepository";
import { IHRUserRepository } from "@domain/repositories/IHRUserRepository";
import { IBcryptService } from "@application/interfaces/IBcryptService";
import { RegisterCompanyRequestDto } from "@application/dtos/auth/hr/Request/RegisterCompanyRequest.dto";
import { Company } from "@domain/entities/Company";
import { HRUser } from "@domain/entities/HRUser";
import { UserStatus } from "@domain/enums/user.status.enum";
import { Role } from "@domain/enums/Roles.enum";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { IJwtService } from "@application/interfaces/IJwt.service";
import { CrossRoleAuthService } from "@application/services/CrossRoleAuthService";

import { EmailService } from "@infrastructure/services/email/email.service";
import { IOtpRepository } from "@domain/repositories/IOtpRepository";

import { IRegisterCompanyUseCase } from "../interfaces/IRegisterCompany.usecase";

export class RegisterCompanyUseCase implements IRegisterCompanyUseCase {
  constructor(
    private readonly _companyRepository: ICompanyRepository,
    private readonly _hrUserRepository: IHRUserRepository,
    private readonly _bcryptService: IBcryptService,
    private readonly _jwtService: IJwtService,
    private readonly _otpRepository: IOtpRepository,
    private readonly _emailService: EmailService,
    private readonly _crossRoleAuthService: CrossRoleAuthService
  ) { }

  async execute(dto: RegisterCompanyRequestDto) {
    const globalCheck = await this._crossRoleAuthService.isEmailInUse(dto.email);
    if (globalCheck.inUse) {
      // Only block if it's a different role OR if it's the same role but already verified (ACTIVE)
      if (globalCheck.role !== "HR" || globalCheck.status !== UserStatus.PENDING) {
        throw new AppError(`This email is already registered as a ${globalCheck.role}`, HttpStatus.BAD_REQUEST, ErrorCode.USER_ALREADY_EXISTS);
      }
    }

    const existingUser = await this._hrUserRepository.findByEmail(dto.email);

    if (existingUser) {
      if (existingUser.status === UserStatus.PENDING) {
        // Handle Resend OTP: User exists but not verified
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        console.log(`[OTP RE-GENERATED] Email: ${dto.email}, OTP: ${otp}`);
        await this._otpRepository.deleteByEmail(dto.email);
        await this._otpRepository.create(dto.email, otp);
        await this._emailService.sendOTP(dto.email, otp, "New Company");

        return {
          requiresOtp: true,
          email: dto.email,
          message: "A new OTP has been sent to your email.",
        };
      }
      throw new AppError("HR User with this email already exists", HttpStatus.BAD_REQUEST, ErrorCode.USER_ALREADY_EXISTS);
    }

    // Step 1: Create Company (pending)
    const company = await this._companyRepository.create(
      Company.create({
        name: `Pending Company (${dto.firstName} ${dto.lastName}) - ${Date.now()}`,
        onboardingStep: 0,
        status: UserStatus.PENDING,
      })
    );

    const hashedPassword = await this._bcryptService.hash(dto.password);

    // Step 2: Create HR User (pending)
    const hrUser = await this._hrUserRepository.create(
      HRUser.create({
        companyId: company.id!,
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        password: hashedPassword,
        designation: dto.jobTitle,
        role: Role.HR,
        status: UserStatus.PENDING,
      })
    );

    // Step 3: Generate and save OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`[OTP GENERATED] Email: ${dto.email}, OTP: ${otp}`); // As requested by user
    await this._otpRepository.create(dto.email, otp);

    // Step 4: Send OTP Email
    await this._emailService.sendOTP(dto.email, otp, "New Company");

    return {
      requiresOtp: true,
      email: dto.email,
      message: "An OTP has been sent to your email.",
    };
  }
}
