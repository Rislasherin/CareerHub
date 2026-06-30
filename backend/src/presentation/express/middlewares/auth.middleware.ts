import { NextFunction, Request, Response } from "express";
import { IJwtService } from "@application/interfaces/IJwt.service";
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

  protect = async (req: Request, _res: Response, next: NextFunction) => {
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

      const decoded = this._jwtService.verifyAccessToken(token) as any; // Revert to any for jwt payload temporary to fix type error

      // Real-time status check to handle automatic logout if blocked
      let user: any;
      switch (decoded.role) {
        case Role.STUDENT:
          user = await this._studentRepository.findById(decoded.id);
          break;
        case Role.HR:
          user = await this._hrUserRepository.findById(decoded.id);
          if (user && user.companyId) {
            const company: any = await this._companyRepository.findById(user.companyId);
            if (company) {
              const userJson = user.toJSON ? user.toJSON() : user;
              const companyJson = company.toJSON ? company.toJSON() : company;

              // Check if company is blocked
              if (companyJson.status === UserStatus.BLOCKED) {
                throw new UnauthorizedError("Your company has been blocked. Please contact admin.");
              }
              // Check if company is pending approval but trying to access restricted routes
              const allowedPendingPaths = ['/auth/me', '/auth/logout', '/auth/hr/onboarding', '/auth/college-admin/onboarding'];
              if (companyJson.status === UserStatus.PENDING && companyJson.onboardingStep >= 3) {
                const isAllowed = allowedPendingPaths.some(p => req.originalUrl.includes(p));
                if (!isAllowed) {
                  throw new UnauthorizedError("Your company account is currently pending administrator approval.");
                }
              }

              user = { ...userJson, onboardingStep: companyJson.onboardingStep };
            }
          }
          break;
        case Role.INTERVIEWER:
          user = await this._interviewerRepository.findById(decoded.id);
          if (user && user.companyId) {
            const company: any = await this._companyRepository.findById(user.companyId);
            if (company && company.status === UserStatus.BLOCKED) {
              throw new UnauthorizedError("Your company has been blocked. Please contact admin.");
            }
          }
          break;
        case Role.COLLEGE_ADMIN:
          user = await this._collegeAdminRepository.findById(decoded.id);
          if (user && user.orgId) {
            const org: any = await this._organizationRepository.findById(user.orgId);
            if (org) {
              const userJson = user.toJSON ? user.toJSON() : user;
              const orgJson = org.toJSON ? org.toJSON() : org;

              // Check if organization is blocked
              if (orgJson.status === UserStatus.BLOCKED) {
                throw new UnauthorizedError("Your institution has been blocked. Please contact admin.");
              }
              // Check if organization is pending approval
              const allowedPendingPaths = ['/auth/me', '/auth/logout', '/auth/hr/onboarding', '/auth/college-admin/onboarding'];
              if (orgJson.status === UserStatus.PENDING && orgJson.onboardingStep >= 3) {
                const isAllowed = allowedPendingPaths.some(p => req.originalUrl.includes(p));
                if (!isAllowed) {
                  throw new UnauthorizedError("Your institution account is currently pending administrator approval.");
                }
              }

              user = { 
                ...userJson, 
                onboardingStep: orgJson.onboardingStep,
                collegeName: orgJson.name,
                activeBranches: orgJson.activeBranches || []
              };
            }
          }
          break;
        case Role.SUPER_ADMIN:
          user = await this._superAdminRepository.findById(decoded.id);
          break;
      }

      if (!user || user.status === UserStatus.BLOCKED) {
        throw new UnauthorizedError("Your account has been blocked or no longer exists.");
      }

      const userData = user.toJSON ? user.toJSON() : (user.toObject ? user.toObject() : user);
      req.user = { ...decoded, ...userData };
      next();
    } catch (error) {
      next(error);
    }
  };
}
