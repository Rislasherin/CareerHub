import { InvalidCredentialsError, UnauthorizedError } from "@application/errors/AuthError";
import { IHRUserRepository } from "@domain/repositories/IHRUserRepository";
import { ICompanyRepository } from "@domain/repositories/ICompanyRepository";
import { IJwtService } from "@application/interfaces/IJwt.service";
import { IBcryptService } from "@application/interfaces/IBcryptService";
import { UserStatus } from "@domain/enums/user.status.enum";
import { Role } from "@domain/enums/Roles.enum";

import { ILoginHRUseCase } from "../interfaces/ILoginHR.usecase";

export class LoginHRUseCase implements ILoginHRUseCase {
  constructor(
    private readonly _hrUserRepository: IHRUserRepository,
    private readonly _companyRepository: ICompanyRepository,
    private readonly _jwtService: IJwtService,
    private readonly _bcryptService: IBcryptService
  ) { }

  async execute(dto: { email: string; password: string; [key: string]: unknown }) {
    const hrUser = await this._hrUserRepository.findByEmail(dto.email);

    if (!hrUser) {
      throw new InvalidCredentialsError();
    }

    if (hrUser.status === UserStatus.BLOCKED || hrUser.status === UserStatus.REJECTED) {
      throw new UnauthorizedError("Your account has been blocked or rejected.");
    }

    if (hrUser.status !== UserStatus.ACTIVE && hrUser.status !== UserStatus.PENDING) {
      throw new UnauthorizedError("Your account is not active");
    }

    const isPasswordValid = await this._bcryptService.compare(dto.password, hrUser.password);

    if (!isPasswordValid) {
      throw new InvalidCredentialsError();
    }

    const company = await this._companyRepository.findById(hrUser.companyId);

    if (company?.status === UserStatus.BLOCKED) {
      throw new UnauthorizedError("Your company has been blocked. Please contact admin.");
    }

    if (company?.status === UserStatus.PENDING && (company?.onboardingStep ?? 0) >= 3) {
      throw new UnauthorizedError("Your account is currently pending administrator approval.");
    }

    const payload = {
      id: hrUser.id!,
      role: Role.HR,
      companyId: hrUser.companyId,
    };

    return {
      accessToken: this._jwtService.signAccessToken(payload),
      refreshToken: this._jwtService.signRefreshToken(payload),
      hrUser: {
        id: hrUser.id,
        firstName: hrUser.firstName,
        lastName: hrUser.lastName,
        email: hrUser.email,
        role: hrUser.role,
        companyId: hrUser.companyId,
      },
      company: company?.toJSON(),
    };
  }
}
