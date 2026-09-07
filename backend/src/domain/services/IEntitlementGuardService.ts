import { FeatureKey } from "./../enums/FeatureKey.enum";

export interface IEntitlementGuardService {
  canAddStudent(collegeId: string): Promise<boolean>;
  canAddStudents(collegeId: string, count: number): Promise<boolean>;
  canAccessFeature(collegeId: string, featureCode: string): Promise<boolean>;
  assertFeatureEntitlement(collegeId: string, feature: FeatureKey): Promise<void>;
}
