import { FeatureKey } from "./../enums/FeatureKey.enum";

export interface IEntitlementGuardService {
  canAddStudent(collegeId: string): Promise<boolean>;
  canAddStudents(collegeId: string, count: number): Promise<boolean>;
  canAccessFeature(collegeId: string, featureCode: string): Promise<boolean>;
  assertFeatureEntitlement(collegeId: string, feature: FeatureKey): Promise<void>;
  
  hasFeature(collegeId: string, feature: string): Promise<boolean>;
  getLimit(collegeId: string, quotaKey: 'MAX_STUDENTS' | 'AI_CREDITS' | 'STORAGE_GB'): Promise<number>;
  assertFeatureAccess(collegeId: string, feature: FeatureKey | string): Promise<void>;
  assertWithinLimit(collegeId: string, quotaKey: 'MAX_STUDENTS' | 'STORAGE_GB', currentUsage: number, requestedAddition: number): Promise<void>;
  getEffectiveEntitlements(collegeId: string): Promise<Record<string, any>>;
}
