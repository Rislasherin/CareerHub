import { InvalidCredentialsError, UnauthorizedError } from "@application/errors/AuthError";
import { ICollegeAdminRepository } from "@domain/repositories/ICollegeAdminRepository";
import { IOrganizationRepository } from "@domain/repositories/IOrganizationRepository";
import { IJwtService } from "@application/interfaces/IJwt.service";
import { IBcryptService } from "@application/interfaces/IBcryptService";
import { UserStatus } from "@domain/enums/user.status.enum";
import { Role } from "@domain/enums/Roles.enum";

export class LoginCollegeAdminUseCase {
  constructor(
    private readonly _collegeAdminRepository: ICollegeAdminRepository,
    private readonly _organizationRepository: IOrganizationRepository,
    private readonly _jwtService: IJwtService,
    private readonly _bcryptService: IBcryptService
  ) {}

  async execute(dto: any) {
    const admin = await this._collegeAdminRepository.findByEmail(dto.email);

    if (!admin) {
      throw new InvalidCredentialsError();
    }

    if (admin.status === UserStatus.BLOCKED || admin.status === UserStatus.REJECTED) {
      throw new UnauthorizedError("Your account has been blocked or rejected.");
    }

    if (admin.status !== UserStatus.ACTIVE && admin.status !== UserStatus.PENDING) {
      throw new UnauthorizedError("Your account is not active. Please verify your email.");
    }

    const isPasswordValid = await this._bcryptService.compare(dto.password, admin.password);

    if (!isPasswordValid) {
      throw new InvalidCredentialsError();
    }

    const organization = await this._organizationRepository.findById(admin.orgId);

    if (organization?.status === UserStatus.BLOCKED) {
      throw new UnauthorizedError("Your institution has been blocked. Please contact admin.");
    }

    const payload = {
      id: admin.id!,
      role: Role.COLLEGE_ADMIN,
      orgId: admin.orgId,
    };

    return {
      accessToken: this._jwtService.signAccessToken(payload),
      refreshToken: this._jwtService.signRefreshToken(payload),
      admin: {
        id: admin.id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        role: admin.role,
        organizationId: admin.orgId,
      },
      organization: organization?.toJSON(),
    };
  }
}
