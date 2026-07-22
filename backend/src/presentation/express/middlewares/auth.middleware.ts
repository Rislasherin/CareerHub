import { NextFunction, Request, Response } from "express";
import { IJwtService, JwtPayload } from "@application/interfaces/IJwt.service";
import { UnauthorizedError } from "@application/errors/AuthError";
import { IStudentRepository } from "@domain/repositories/IStudentRepository";
import { IHRUserRepository } from "@domain/repositories/IHRUserRepository";
import { IInterviewerRepository } from "@domain/repositories/IInterviewerRepository";
import { ICollegeAdminRepository } from "@domain/repositories/ICollegeAdminRepository";
import { ISuperAdminRepository } from "@domain/repositories/ISuperAdminRepository";
import { IOrganizationRepository } from "@domain/repositories/IOrganizationRepository";
import { ICompanyRepository } from "@domain/repositories/ICompanyRepository";
import { UserStatus } from "@domain/enums/user.status.enum";
import { Role } from "@domain/enums/Roles.enum";

/** Normalized key-value map used internally after serializing a domain entity */
type EntityJson = Record<string, unknown>;

export class AuthMiddleware {
  constructor(
    private readonly _jwtService: IJwtService,
    private readonly _studentRepository: IStudentRepository,
    private readonly _hrUserRepository: IHRUserRepository,
    private readonly _interviewerRepository: IInterviewerRepository,
    private readonly _collegeAdminRepository: ICollegeAdminRepository,
    private readonly _superAdminRepository: ISuperAdminRepository,
    private readonly _organizationRepository: IOrganizationRepository,
    private readonly _companyRepository: ICompanyRepository
  ) { }

  protect = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      let token: string | undefined;

      if (req.cookies && req.cookies.accessToken) {
        token = req.cookies.accessToken;
      } else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
        token = req.headers.authorization.split(" ")[1];
      }

      if (!token) {
        throw new UnauthorizedError("Access token missing");
      }

      const decoded: JwtPayload = this._jwtService.verifyAccessToken(token);

      let user: EntityJson | null = null;

      switch (decoded.role) {
        case Role.STUDENT:
          user = this._toJson(await this._studentRepository.findById(decoded.id));
          break;

        case Role.HR: {
          const hrUser = this._toJson(await this._hrUserRepository.findById(decoded.id));
          if (hrUser && hrUser.companyId) {
            const company = this._toJson(await this._companyRepository.findById(hrUser.companyId as string));
            if (company) {
              if (company.status === UserStatus.BLOCKED) {
                throw new UnauthorizedError("Your company has been blocked. Please contact admin.");
              }
              const allowedPendingPaths = ['/auth/me', '/auth/logout', '/auth/hr/onboarding', '/auth/college-admin/onboarding'];
              if (company.status === UserStatus.PENDING && (company.onboardingStep as number) >= 3) {
                if (!allowedPendingPaths.some(p => req.originalUrl.includes(p))) {
                  throw new UnauthorizedError("Your company account is currently pending administrator approval.");
                }
              }
              user = { ...hrUser, onboardingStep: company.onboardingStep };
            } else {
              user = hrUser;
            }
          } else {
            user = hrUser;
          }
          break;
        }

        case Role.INTERVIEWER: {
          const interviewerUser = this._toJson(await this._interviewerRepository.findById(decoded.id));
          if (interviewerUser && interviewerUser.companyId) {
            const company = this._toJson(await this._companyRepository.findById(interviewerUser.companyId as string));
            if (company && company.status === UserStatus.BLOCKED) {
              throw new UnauthorizedError("Your company has been blocked. Please contact admin.");
            }
          }
          user = interviewerUser;
          break;
        }

        case Role.COLLEGE_ADMIN: {
          const collegeUser = this._toJson(await this._collegeAdminRepository.findById(decoded.id));
          if (collegeUser && collegeUser.orgId) {
            const org = this._toJson(await this._organizationRepository.findById(collegeUser.orgId as string));
            if (org) {
              if (org.status === UserStatus.BLOCKED) {
                throw new UnauthorizedError("Your institution has been blocked. Please contact admin.");
              }
              const allowedPendingPaths = ['/auth/me', '/auth/logout', '/auth/hr/onboarding', '/auth/college-admin/onboarding'];
              if (org.status === UserStatus.PENDING && (org.onboardingStep as number) >= 3) {
                if (!allowedPendingPaths.some(p => req.originalUrl.includes(p))) {
                  throw new UnauthorizedError("Your institution account is currently pending administrator approval.");
                }
              }
              user = {
                ...collegeUser,
                onboardingStep: org.onboardingStep,
                collegeName: org['name'],
                activeBranches: org['activeBranches'] || []
              };
            } else {
              user = collegeUser;
            }
          } else {
            user = collegeUser;
          }
          break;
        }

        case Role.SUPER_ADMIN:
          user = this._toJson(await this._superAdminRepository.findById(decoded.id));
          break;
      }

      if (!user || user.status === UserStatus.BLOCKED) {
        throw new UnauthorizedError("Your account has been blocked or no longer exists.");
      }

      req.user = { ...decoded, ...user };
      next();
    } catch (error) {
      next(error);
    }
  };

  /**
   * Serializes any domain entity to a plain key-value record.
   * Uses `unknown` as input so domain-specific Props types (which lack an
   * index signature) are accepted without modifying the domain layer.
   */
  private _toJson(entity: unknown): EntityJson | null {
    if (entity === null || entity === undefined) return null;
    const e = entity as Record<string, unknown>;
    if (typeof e['toJSON'] === 'function') return (e['toJSON'] as () => EntityJson)();
    if (typeof e['toObject'] === 'function') return (e['toObject'] as () => EntityJson)();
    return e;
  }
}
