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

export interface IRegisterCompanyUseCase {
  execute(dto: RegisterCompanyRequestDto): Promise<{ accessToken: string; refreshToken: string; company: any; hrUser: any }>;
}

export class RegisterCompanyUseCase implements IRegisterCompanyUseCase {
  constructor(
    private readonly _companyRepository: ICompanyRepository,
    private readonly _hrUserRepository: IHRUserRepository,
    private readonly _bcryptService: IBcryptService,
    private readonly _jwtService: IJwtService
  ) {}

  async execute(dto: RegisterCompanyRequestDto) {
    const existingUser = await this._hrUserRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new AppError("HR User with this email already exists", HttpStatus.BAD_REQUEST, ErrorCode.USER_ALREADY_EXISTS);
    }

    // Step 1: Create Company (basic info)
    const company = await this._companyRepository.create(
      Company.create({
        name: dto.companyName,
        onboardingStep: 1,
        status: "active",
      })
    );

    const hashedPassword = await this._bcryptService.hash(dto.password);

    // Step 1: Create HR User
    const hrUser = await this._hrUserRepository.create(
      HRUser.create({
        companyId: company.id!,
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        password: hashedPassword,
        designation: "Admin", // Default designation for the registering HR
        role: Role.HR,
        status: UserStatus.ACTIVE,
      })
    );

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
