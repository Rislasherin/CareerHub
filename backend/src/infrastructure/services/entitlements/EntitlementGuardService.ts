import { IEntitlementGuardService } from "@domain/services/IEntitlementGuardService";
import { ISubscriptionRepository } from "@domain/repositories/ISubscriptionRepository";
import { IPlanRepository } from "@domain/repositories/IPlanRepository";
import { IStudentRepository } from "@domain/repositories/IStudentRepository";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { FeatureKey } from "@domain/enums/FeatureKey.enum";
import { IOrganizationRepository } from "@domain/repositories/IOrganizationRepository";
import { Plan } from "@domain/entities/Plan";

export class EntitlementGuardService implements IEntitlementGuardService {
  constructor(
    private readonly subscriptionRepo: ISubscriptionRepository,
    private readonly planRepo: IPlanRepository,
    private readonly studentRepo: IStudentRepository,
    private readonly organizationRepo: IOrganizationRepository
  ) {}

  private async resolvePlan(collegeId: string): Promise<Plan> {
    const org = await this.organizationRepo.findById(collegeId);
    if (org && org.isTrialActive) {
      const trialPlan = await this.planRepo.findByCode('TRIAL');
      if (trialPlan) return trialPlan;
    }

    const subscription = await this.subscriptionRepo.findByCollegeId(collegeId);
    if (!subscription || subscription.status !== 'ACTIVE') {
      throw new AppError("No active subscription found", HttpStatus.FORBIDDEN, ErrorCode.FORBIDDEN);
    }

    const plan = await this.planRepo.findById(subscription.planId);
    if (!plan) {
      throw new AppError("Plan not found", HttpStatus.FORBIDDEN, ErrorCode.FORBIDDEN);
    }
    return plan;
  }

  async hasFeature(collegeId: string, feature: string): Promise<boolean> {
    try {
      const plan = await this.resolvePlan(collegeId);
      return plan.features.includes(feature);
    } catch {
      return false;
    }
  }

  async getLimit(collegeId: string, quotaKey: 'MAX_STUDENTS' | 'AI_CREDITS' | 'STORAGE_GB'): Promise<number> {
    try {
      const plan = await this.resolvePlan(collegeId);
      switch (quotaKey) {
        case 'MAX_STUDENTS': return plan.maxStudents;
        case 'AI_CREDITS': return plan.aiCredits;
        case 'STORAGE_GB': return plan.storageLimit;
        default: return 0;
      }
    } catch {
      return 0;
    }
  }

  async getEffectiveEntitlements(collegeId: string): Promise<Record<string, any>> {
    try {
      const plan = await this.resolvePlan(collegeId);
      return {
        planName: plan.name,
        planCode: plan.code,
        maxStudents: plan.maxStudents,
        aiCredits: plan.aiCredits,
        storageLimit: plan.storageLimit,
        features: plan.features
      };
    } catch {
      return {
        planName: 'None',
        planCode: 'NONE',
        maxStudents: 0,
        aiCredits: 0,
        storageLimit: 0,
        features: []
      };
    }
  }

  async assertFeatureAccess(collegeId: string, feature: FeatureKey | string): Promise<void> {
    const hasAccess = await this.hasFeature(collegeId, feature);
    if (!hasAccess) {
      throw new AppError(`Feature ${feature} is not available in your college's current subscription plan.`, HttpStatus.FORBIDDEN, ErrorCode.FORBIDDEN);
    }
  }

  async assertWithinLimit(collegeId: string, quotaKey: 'MAX_STUDENTS' | 'STORAGE_GB', currentUsage: number, requestedAddition: number): Promise<void> {
    const limit = await this.getLimit(collegeId, quotaKey);
    if (limit === -1) return; // unlimited
    
    if (currentUsage + requestedAddition > limit) {
      throw new AppError(
        `${quotaKey} limit reached. Current: ${currentUsage}, Requested: ${requestedAddition}, Limit: ${limit}, Remaining: ${limit - currentUsage}`,
        HttpStatus.FORBIDDEN,
        ErrorCode.FORBIDDEN
      );
    }
  }

  // Backwards compatibility for now
  async canAddStudent(collegeId: string): Promise<boolean> {
    try {
      const current = await this.studentRepo.countByCollegeId(collegeId);
      await this.assertWithinLimit(collegeId, 'MAX_STUDENTS', current, 1);
      return true;
    } catch {
      return false;
    }
  }

  async canAddStudents(collegeId: string, count: number): Promise<boolean> {
    try {
      const current = await this.studentRepo.countByCollegeId(collegeId);
      await this.assertWithinLimit(collegeId, 'MAX_STUDENTS', current, count);
      return true;
    } catch {
      return false;
    }
  }

  async canAccessFeature(collegeId: string, featureCode: string): Promise<boolean> {
    return this.hasFeature(collegeId, featureCode);
  }

  async assertFeatureEntitlement(collegeId: string, feature: FeatureKey): Promise<void> {
    return this.assertFeatureAccess(collegeId, feature);
  }
}
