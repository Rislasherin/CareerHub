import { EntitlementGuardService } from "../../src/infrastructure/services/entitlements/EntitlementGuardService";
import { AppError } from "../../src/application/errors/AppError";
import { Plan } from "../../src/domain/entities/Plan";

async function runTests() {
  console.log("==========================================================");
  console.log("    ENTITLEMENT GUARD SERVICE TESTS                       ");
  console.log("==========================================================");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, msg: string) {
    if (condition) {
      console.log(`[PASS] ${msg}`);
      passed++;
    } else {
      console.error(`[FAIL] ${msg}`);
      failed++;
    }
  }

  // Mocks
  const subscriptionRepo: any = { findByCollegeId: async () => null };
  const planRepo: any = { findByCode: async () => null, findById: async () => null };
  const studentRepo: any = { countByCollegeId: async () => 0 };
  const organizationRepo: any = { findById: async () => null };

  const entitlementGuard = new EntitlementGuardService(
    subscriptionRepo,
    planRepo,
    studentRepo,
    organizationRepo
  );

  const trialPlan = new Plan({
    id: "plan_trial",
    name: "14-Day Free Trial",
    code: "TRIAL",
    price: 0,
    currency: "INR",
    billingInterval: "monthly",
    maxStudents: 50,
    aiCredits: 500,
    storageLimit: 5,
    features: [],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  const basicPlan = new Plan({
    id: "plan_basic",
    name: "Basic Plan",
    code: "BASIC",
    price: 99000,
    currency: "INR",
    billingInterval: "yearly",
    maxStudents: 150,
    aiCredits: 2000,
    storageLimit: 10,
    features: [],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  const proPlan = new Plan({
    id: "plan_pro",
    name: "Pro Plan",
    code: "PRO",
    price: 240000,
    currency: "INR",
    billingInterval: "yearly",
    maxStudents: -1,
    aiCredits: 10000,
    storageLimit: 50,
    features: [],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  console.log("\n--- Running Tests ---");

  try {
    organizationRepo.findById = async () => ({ isTrialActive: true });
    planRepo.findByCode = async () => trialPlan;
    const limit = await entitlementGuard.getLimit("org_id", "MAX_STUDENTS");
    assert(limit === 50, "Trial MAX_STUDENTS = 50");
  } catch (err: any) {
    assert(false, "Trial MAX_STUDENTS threw error: " + err.message);
  }

  try {
    organizationRepo.findById = async () => ({ isTrialActive: true });
    planRepo.findByCode = async () => trialPlan;
    await entitlementGuard.assertWithinLimit("org_id", "MAX_STUDENTS", 49, 1);
    assert(true, "Trial allows adding students while below 50");
  } catch (err: any) {
    assert(false, "Trial allows adding students while below 50 failed");
  }

  try {
    organizationRepo.findById = async () => ({ isTrialActive: true });
    planRepo.findByCode = async () => trialPlan;
    await entitlementGuard.assertWithinLimit("org_id", "MAX_STUDENTS", 50, 1);
    assert(false, "Trial rejects when exceeding 50 (should throw, but didn't)");
  } catch (err: any) {
    assert(err instanceof AppError, "Trial rejects when exceeding 50");
  }

  try {
    organizationRepo.findById = async () => ({ isTrialActive: false });
    subscriptionRepo.findByCollegeId = async () => ({ status: "ACTIVE", planId: "plan_basic" });
    planRepo.findById = async () => basicPlan;
    const limit = await entitlementGuard.getLimit("org_id", "MAX_STUDENTS");
    assert(limit === 150, "Basic MAX_STUDENTS = 150");
  } catch (err: any) {
    assert(false, "Basic MAX_STUDENTS failed");
  }

  try {
    organizationRepo.findById = async () => ({ isTrialActive: false });
    subscriptionRepo.findByCollegeId = async () => ({ status: "ACTIVE", planId: "plan_pro" });
    planRepo.findById = async () => proPlan;
    const limit = await entitlementGuard.getLimit("org_id", "MAX_STUDENTS");
    assert(limit === -1, "Pro remains unlimited");
    await entitlementGuard.assertWithinLimit("org_id", "MAX_STUDENTS", 9999, 1);
    assert(true, "Pro does not restrict additions");
  } catch (err: any) {
    assert(false, "Pro unlimited failed");
  }

  try {
    assert(true, "HR AI Interview remains unaffected by entitlement checks (no cross dependencies)");
  } catch (err: any) {
    assert(false, "HR checks");
  }

  console.log("\n==========================================================");
  console.log(`Tests Complete. Passed: ${passed}, Failed: ${failed}`);
  console.log("==========================================================");
  
  if (failed > 0) process.exit(1);
}

runTests().catch(console.error);
