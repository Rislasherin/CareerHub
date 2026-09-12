import { IEntitlementGuardService } from "@domain/services/IEntitlementGuardService";
import { ISubscriptionRepository } from "@domain/repositories/ISubscriptionRepository";
import { IPlanRepository } from "@domain/repositories/IPlanRepository";
import { IStudentRepository } from "@domain/repositories/IStudentRepository";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { FeatureKey } from "@domain/enums/FeatureKey.enum";
import { IOrganizationRepository } from "@domain/repositories/IOrganizationRepository";

export class EntitlementGuardService implements IEntitlementGuardService {
  constructor(
    private readonly subscriptionRepo: ISubscriptionRepository,
    private readonly planRepo: IPlanRepository,
    private readonly studentRepo: IStudentRepository,
    private readonly organizationRepo: IOrganizationRepository
  ) {}

  async canAddStudent(collegeId: string): Promise<boolean> {
    return this.canAddStudents(collegeId, 1);
  }

  async canAddStudents(collegeId: string, count: number): Promise<boolean> {
    const org = await this.organizationRepo.findById(collegeId);
    if (org && org.isTrialActive) {
      // Allow unlimited students during free trial
      return true;
    }

    const subscription = await this.subscriptionRepo.findByCollegeId(collegeId);
    if (!subscription || subscription.status !== 'ACTIVE') return false;

    const plan = await this.planRepo.findById(subscription.planId);
    if (!plan) return false;

    if (plan.maxStudents === null || plan.maxStudents === -1) return true; // Unlimited

    const currentStudentCount = await this.studentRepo.countByCollegeId(collegeId);
    return (currentStudentCount + count) <= plan.maxStudents;
  }

  async canAccessFeature(collegeId: string, featureCode: string): Promise<boolean> {
    try {
      await this.assertFeatureEntitlement(collegeId, featureCode as FeatureKey);
      return true;
    } catch {
      return false;
    }
  }

  async assertFeatureEntitlement(collegeId: string, feature: FeatureKey): Promise<void> {
    const org = await this.organizationRepo.findById(collegeId);
    if (org && org.isTrialActive) {
      return; // Trial gives access to everything
    }

    const subscription = await this.subscriptionRepo.findByCollegeId(collegeId);
    if (!subscription) {
      throw new AppError("Subscription not found", HttpStatus.FORBIDDEN, ErrorCode.FORBIDDEN);
    }
    if (subscription.status !== 'ACTIVE') {
      throw new AppError("Subscription is not active", HttpStatus.FORBIDDEN, ErrorCode.FORBIDDEN);
    }

    const plan = await this.planRepo.findById(subscription.planId);
    if (!plan) {
      throw new AppError("Plan not found", HttpStatus.FORBIDDEN, ErrorCode.FORBIDDEN);
    }

    if (!plan.features.includes(feature)) {
      throw new AppError(`Feature ${feature} is not available in your college's current subscription plan.`, HttpStatus.FORBIDDEN, ErrorCode.FORBIDDEN);
    }
  }
}
