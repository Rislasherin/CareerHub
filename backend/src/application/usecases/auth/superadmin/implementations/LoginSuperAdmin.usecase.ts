import { InvalidCredentialsError } from "@application/errors/AuthError";
import { ISuperAdminRepository } from "@domain/repositories/ISuperAdminRepository";
import { IJwtService } from "@application/interfaces/IJwt.service";
import { IBcryptService } from "@application/interfaces/IBcryptService";
import { Role } from "@domain/enums/Roles.enum";

import { ILoginSuperAdminUseCase } from "../interfaces/ILoginSuperAdmin.usecase";

export class LoginSuperAdminUseCase implements ILoginSuperAdminUseCase {
  constructor(
    private readonly _superAdminRepository: ISuperAdminRepository,
    private readonly _jwtService: IJwtService,
    private readonly _bcryptService: IBcryptService
  ) { }

  async execute(dto: { email: string; password: string; [key: string]: unknown }) {
    const admin = await this._superAdminRepository.findByEmail(dto.email);

    if (!admin) {
      throw new InvalidCredentialsError();
    }

    const isPasswordValid = await this._bcryptService.compare(dto.password, admin.password);

    if (!isPasswordValid) {
      throw new InvalidCredentialsError();
    }

    const payload = {
      id: admin.id!,
      role: Role.SUPER_ADMIN,
    };

    return {
      accessToken: this._jwtService.signAccessToken(payload),
      refreshToken: this._jwtService.signRefreshToken(payload),
      admin: {
        id: admin.id,
        email: admin.email,
        role: admin.role,
      },
    };
  }
}
