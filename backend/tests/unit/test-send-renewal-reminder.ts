declare const process: any;

import { SendRenewalReminderUseCase } from "../../src/application/usecases/super-admin/implementations/SendRenewalReminder.usecase";
import { ISubscriptionRepository } from "../../src/domain/repositories/ISubscriptionRepository";
import { IOrganizationRepository } from "../../src/domain/repositories/IOrganizationRepository";
import { ICollegeAdminRepository } from "../../src/domain/repositories/ICollegeAdminRepository";
import { IEmailService } from "../../src/application/services/IEmailService";
import { Organization } from "../../src/domain/entities/Organization";
import { CollegeAdmin } from "../../src/domain/entities/CollegeAdmin";
import { UserStatus } from "../../src/domain/enums/user.status.enum";
import { Role } from "../../src/domain/enums/Roles.enum";

async function runTests() {
  console.log("==========================================================");
  console.log("   SEND RENEWAL REMINDER USE CASE FALLBACK UNIT TESTS      ");
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

  // 1. Setup mock subscription, organization, college admin
  const mockSub = {
    id: "sub-123",
    collegeId: "org-123",
    planType: "PRO",
    endDate: new Date(),
  };

  const mockOrgNoEmail = Organization.create({
    id: "org-123",
    name: "Mock College",
    city: "New York",
    status: UserStatus.ACTIVE,
  });

  const mockOrgWithEmail = Organization.create({
    id: "org-123",
    name: "Mock College",
    city: "New York",
    status: UserStatus.ACTIVE,
    placementContactEmail: "org-contact@college.edu",
  });

  const mockCollegeAdmin = CollegeAdmin.create({
    id: "admin-123",
    firstName: "John",
    lastName: "Doe",
    email: "admin-contact@college.edu",
    password: "hashedpassword",
    orgId: "org-123",
    role: Role.COLLEGE_ADMIN,
    status: UserStatus.ACTIVE,
  });

  // Mock repositories
  const subRepo: Partial<ISubscriptionRepository> = {
    findById: async (id) => (id === "sub-123" ? (mockSub as any) : null),
  };

  let orgMockValue = mockOrgNoEmail;
  const orgRepo: Partial<IOrganizationRepository> = {
    findById: async (id) => (id === "org-123" ? orgMockValue : null),
  };

  let collegeAdminMockValue: CollegeAdmin | null = mockCollegeAdmin;
  const collegeAdminRepo: Partial<ICollegeAdminRepository> = {
    findByOrgId: async (orgId) => (orgId === "org-123" ? collegeAdminMockValue : null),
  };

  let sentToEmail = "";
  const emailService: Partial<IEmailService> = {
    sendRenewalReminder: async (email, orgName, planType, endDate) => {
      sentToEmail = email;
      return true;
    },
  };

  // Instantiate UseCase
  const useCase = new SendRenewalReminderUseCase(
    subRepo as any,
    orgRepo as any,
    emailService as any,
    collegeAdminRepo as any
  );

  // Test Case 1: Fallback to College Admin email if placementContactEmail is missing
  try {
    orgMockValue = mockOrgNoEmail;
    collegeAdminMockValue = mockCollegeAdmin;
    sentToEmail = "";
    await useCase.execute("sub-123");
    assert(sentToEmail === "admin-contact@college.edu", "Should fallback to college admin email when organization contact email is empty");
  } catch (err) {
    assert(false, `Test Case 1 failed with error: ${err}`);
  }

  // Test Case 2: Use placementContactEmail if present
  try {
    orgMockValue = mockOrgWithEmail;
    collegeAdminMockValue = mockCollegeAdmin;
    sentToEmail = "";
    await useCase.execute("sub-123");
    assert(sentToEmail === "org-contact@college.edu", "Should use organization contact email when present");
  } catch (err) {
    assert(false, `Test Case 2 failed with error: ${err}`);
  }

  // Test Case 3: Throws error if both placementContactEmail and CollegeAdmin are missing
  try {
    orgMockValue = mockOrgNoEmail;
    collegeAdminMockValue = null;
    sentToEmail = "";
    await useCase.execute("sub-123");
    assert(false, "Should have thrown an error when no email address is available");
  } catch (err: any) {
    assert(err.message.includes("placement contact email not found"), "Should throw validation error when no email is found");
  }

  console.log("==========================================================");
  console.log(`   TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("==========================================================");

  if (failed > 0) {
    process.exit(1);
  }
  process.exit(0);
}

runTests();
