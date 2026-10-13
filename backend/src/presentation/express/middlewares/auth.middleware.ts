import { NextFunction, Request, Response } from "express";
import { IJwtService, JwtPayload } from "@application/interfaces/IJwt.service";
import { UnauthorizedError } from "@application/errors/AuthError";
import { IStudentRepository } from "@domain/repositories/IStudentRepository";
import { IHRUserRepository } from "@domain/repositories/IHRUserRepository";

import { ICollegeAdminRepository } from "@domain/repositories/ICollegeAdminRepository";
import { ISuperAdminRepository } from "@domain/repositories/ISuperAdminRepository";
import { IOrganizationRepository } from "@domain/repositories/IOrganizationRepository";
import { ICompanyRepository } from "@domain/repositories/ICompanyRepository";
import { ISubscriptionRepository } from "@domain/repositories/ISubscriptionRepository";
import { UserStatus } from "@domain/enums/user.status.enum";
import { Role } from "@domain/enums/Roles.enum";
import { SubscriptionStatus } from "@domain/enums/SubscriptionStatus.enum";

/** Normalized key-value map used internally after serializing a domain entity */
type EntityJson = Record<string, unknown>;

export class AuthMiddleware {
  constructor(
    private readonly _jwtService: IJwtService,
    private readonly _studentRepository: IStudentRepository,
    private readonly _hrUserRepository: IHRUserRepository,

    private readonly _collegeAdminRepository: ICollegeAdminRepository,
    private readonly _superAdminRepository: ISuperAdminRepository,
    private readonly _organizationRepository: IOrganizationRepository,
    private readonly _companyRepository: ICompanyRepository,
    private readonly _subscriptionRepository?: ISubscriptionRepository
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
              const allowedPendingPaths = [
                '/auth/me', 
                '/auth/status', 
                '/auth/logout', 
                '/auth/hr/onboarding', 
                '/auth/hr/resubmit',
                '/auth/college-admin/onboarding',
                '/auth/hr/verification-documents'
              ];
              const isRestricted = company.status === UserStatus.REJECTED || (company.status === UserStatus.PENDING && (company.onboardingStep as number) >= 3);
              if (isRestricted) {
                const normalizedPath = req.originalUrl.replace(/^\/api/, '');
                const isAllowed = allowedPendingPaths.some(p => normalizedPath.startsWith(p));
                if (!isAllowed) {
                  if (company.status === UserStatus.REJECTED) {
                    throw new UnauthorizedError("Your company application was rejected. Please review feedback and resubmit.");
                  }
                  throw new UnauthorizedError("Your company account is currently pending administrator approval.");
                }
              }
              user = { 
                ...hrUser, 
                onboardingStep: company.onboardingStep,
                companyName: company['name'],
                name: company['name'],
                industry: company['industry'],
                sector: company['sector'],
                size: company['size'],
                website: company['website'],
                headquarters: company['headquarters'],
                location: company['location'],
                description: company['description'],
                contactName: company['contactName'],
                contactEmail: company['contactEmail'],
                contactPhone: company['contactPhone'],
                contactJobTitle: company['contactJobTitle'],
                preferredColleges: company['preferredColleges'],
                logoUrl: company['logoUrl'],
                verificationDocument: company['verificationDocument'],
                status: company.status || hrUser.status,
                companyStatus: company.status,
                rejectionReason: company['rejectionReason'],
                rejectedAt: company['rejectedAt'],
                resubmittedAt: company['resubmittedAt'],
                approvedAt: company['approvedAt'],
                statusHistory: company['statusHistory']
              };
            } else {
              user = hrUser;
            }
          } else {
            user = hrUser;
          }
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
              // Check if organization is pending approval or rejected
              const allowedPendingPaths = [
                '/auth/me', 
                '/auth/status', 
                '/auth/logout', 
                '/auth/hr/onboarding', 
                '/auth/college-admin/onboarding', 
                '/auth/college-admin/resubmit',
                '/subscription/create'
              ];
              const isRestricted = org.status === UserStatus.REJECTED || (org.status === UserStatus.PENDING && (org.onboardingStep as number) >= 3);
              if (isRestricted) {
                const normalizedPath = req.originalUrl.replace(/^\/api/, '');
                const isAllowed = allowedPendingPaths.some(p => normalizedPath.startsWith(p));
                if (!isAllowed) {
                  if (org.status === UserStatus.REJECTED) {
                    throw new UnauthorizedError("Your institution application was rejected. Please review feedback and resubmit.");
                  }
                  throw new UnauthorizedError("Your institution account is currently pending administrator approval.");
                }
              }

              // Check if trial has expired and no active subscription
              if (org.status === UserStatus.ACTIVE && org.trialEndsAt) {
                const isTrialExpired = new Date(org.trialEndsAt as string | number | Date) < new Date();
                
                if (isTrialExpired) {
                  let hasActiveSubscription = false;
                  if (this._subscriptionRepository) {
                    const sub = await this._subscriptionRepository.findByCollegeId(org.id as string);
                    hasActiveSubscription = sub?.status === SubscriptionStatus.ACTIVE;
                  }
                  
                  const isAllowed = ['/auth/logout', '/subscription/create', '/auth/me', '/auth/status'].some(p => req.originalUrl.includes(p));
                  if (!hasActiveSubscription && !isAllowed) {
                    throw new UnauthorizedError("Your trial has expired. Please subscribe to continue using the platform.");
                  }
                }
              }

              user = { 
                ...collegeUser, 
                onboardingStep: org.onboardingStep,
                collegeName: org['name'],
                name: org['name'],
                shortName: org['shortName'],
                yearEstablished: org['yearEstablished'],
                website: org['website'],
                address: org['address'],
                city: org['city'],
                state: org['state'],
                naacGrade: org['naacGrade'],
                placementCellName: org['placementCellName'],
                placementContactEmail: org['placementContactEmail'] || collegeUser['email'],
                placementContactPhone: org['placementContactPhone'],
                logoUrl: org['logoUrl'],
                verificationDocument: org['verificationDocument'],
                activeBranches: org['activeBranches'] || [],
                currentAcademicYear: org['currentAcademicYear'],
                activePlacementBatch: org['activePlacementBatch'],
                plan: org['plan'] || null,
                trialEndsAt: org['trialEndsAt'] || null,
                status: org['status'] || collegeUser['status'],
                rejectionReason: org['rejectionReason'] || null,
                rejectedAt: org['rejectedAt'] || null,
                resubmittedAt: org['resubmittedAt'] || null,
                approvedAt: org['approvedAt'] || null,
                statusHistory: org['statusHistory'] || []
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
