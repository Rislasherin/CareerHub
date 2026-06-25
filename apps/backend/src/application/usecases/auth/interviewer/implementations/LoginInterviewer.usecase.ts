import { InvalidCredentialsError, UnauthorizedError } from "@application/errors/AuthError";
import { IInterviewerRepository } from "@domain/repositories/IInterviewerRepository";
import { ICompanyRepository } from "@domain/repositories/ICompanyRepository";
import { IJwtService } from "@application/interfaces/IJwt.service";
import { IBcryptService } from "@application/interfaces/IBcryptService";
import { UserStatus } from "@domain/enums/user.status.enum";
import { Role } from "@domain/enums/Roles.enum";
import { CrossRoleAuthService } from "@application/services/CrossRoleAuthService";

export class LoginInterviewerUseCase {
  constructor(
    private readonly _interviewerRepository: IInterviewerRepository,
    private readonly _companyRepository: ICompanyRepository,
    private readonly _jwtService: IJwtService,
    private readonly _bcryptService: IBcryptService,
    private readonly _crossRoleAuthService: CrossRoleAuthService
  ) { }

  async execute(dto: any) {
    console.log(`[LOGIN] Attempting login for interviewer: ${dto.email}`);
    const interviewer = await this._interviewerRepository.findByEmail(dto.email);
    console.log(`[LOGIN] Interviewer lookup result: ${interviewer ? 'Found' : 'Not Found'}`);

    if (!interviewer) {
      const globalCheck = await this._crossRoleAuthService.isEmailInUse(dto.email);
      if (globalCheck.inUse) {
        throw new UnauthorizedError(`This email is registered as a ${globalCheck.role}. Please use the correct login portal.`);
      }
      throw new InvalidCredentialsError();
    }

    if (interviewer.status === UserStatus.BLOCKED) {
      throw new UnauthorizedError("Your account has been blocked by admin.");
    }

    if (interviewer.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedError("Your account is not active.");
    }

    const isPasswordValid = await this._bcryptService.compare(dto.password, interviewer.password);

    if (!isPasswordValid) {
      throw new InvalidCredentialsError();
    }

    const company = await this._companyRepository.findById(interviewer.companyId);
    if (company?.status === UserStatus.BLOCKED) {
      throw new UnauthorizedError("Your company has been blocked. Please contact admin.");
    }

    const payload = {
      id: interviewer.id!,
      role: Role.INTERVIEWER,
      companyId: interviewer.companyId,
    };

    return {
      accessToken: this._jwtService.signAccessToken(payload),
      refreshToken: this._jwtService.signRefreshToken(payload),
      interviewer: {
        id: interviewer.id,
        firstName: interviewer.firstName,
        lastName: interviewer.lastName,
        email: interviewer.email,
        role: interviewer.role,
        companyId: interviewer.companyId,
      },
    };
  }
}
