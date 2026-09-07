import { ISubscriptionRepository } from "@domain/repositories/ISubscriptionRepository";
import { IPlanRepository } from "@domain/repositories/IPlanRepository";
import { IStudentRepository } from "@domain/repositories/IStudentRepository";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { FeatureKey } from "@domain/enums/FeatureKey.enum";

export class GetStudentEntitlementsUseCase {
  constructor(
    private readonly subscriptionRepo: ISubscriptionRepository,
    private readonly planRepo: IPlanRepository,
    private readonly studentRepo: IStudentRepository
  ) {}

  async execute(studentId: string) {
    const student = await this.studentRepo.findById(studentId);
    if (!student || !student.collegeId) {
      throw new AppError("Student or college not found", HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }

    const subscription = await this.subscriptionRepo.findByCollegeId(student.collegeId);
    
    // Default empty entitlement if no active subscription exists
    if (!subscription || subscription.status !== 'ACTIVE') {
      return {
        plan: { id: null, type: null, name: "No Active Plan" },
        subscription: { status: "INACTIVE" },
        features: {}
      };
    }

    const plan = await this.planRepo.findById(subscription.planId);
    if (!plan) {
      // In case data is corrupted but sub is active, return no features instead of crashing UX.
      return {
        plan: { id: subscription.planId, type: subscription.planType, name: "Unknown Plan" },
        subscription: { status: subscription.status },
        features: {}
      };
    }

    // Map feature array to boolean map
    const featuresMap = plan.features.reduce((acc, feature) => {
      acc[feature] = true;
      return acc;
    }, {} as Record<string, boolean>);

    return {
      plan: {
        id: plan.id,
        type: subscription.planType || plan.code || "BASIC",
        name: plan.name
      },
      subscription: {
        status: subscription.status
      },
      features: featuresMap
    };
  }
}
