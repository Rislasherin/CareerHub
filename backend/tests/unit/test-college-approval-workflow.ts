declare const process: any;

import { UpdateUserStatusUseCase } from "../../src/application/usecases/super-admin/implementations/UpdateUserStatus.usecase";
import { UpdateCollegeOnboardingUseCase } from "../../src/application/usecases/auth/organization/implementations/UpdateCollegeOnboarding.usecase";
import { LoginCollegeAdminUseCase } from "../../src/application/usecases/auth/organization/implementations/LoginCollegeAdmin.usecase";
import { Organization } from "../../src/domain/entities/Organization";
import { CollegeAdmin } from "../../src/domain/entities/CollegeAdmin";
import { Role } from "../../src/domain/enums/Roles.enum";
import { UserStatus } from "../../src/domain/enums/user.status.enum";
import { AppError } from "../../src/application/errors/AppError";
import { HttpStatus } from "../../src/domain/enums/HttpStatus.enum";

async function runTests() {
  console.log("==========================================================");
  console.log("   COLLEGE APPROVAL, REJECTION & RESUBMISSION TESTS      ");
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

  // In-memory data stores
  let mockOrgs: Record<string, any> = {};
  let mockAdmins: Record<string, any> = {};
  let sentEmails: Array<{ to: string; type: string; reason?: string }> = [];

  const mockOrgRepo: any = {
    findById: async (id: string) => {
      const data = mockOrgs[id];
      if (!data) return null;
      return Organization.create(data);
    },
    findByName: async (name: string) => {
      for (const org of Object.values(mockOrgs)) {
        if (org.name === name) return Organization.create(org);
      }
      return null;
    },
    update: async (id: string, entity: Organization) => {
      mockOrgs[id] = { ...entity.toJSON(), id };
      return Organization.create(mockOrgs[id]);
    },
    updateStatus: async (id: string, status: string, blockedBy?: string, rejectionReason?: string, changedBy?: string) => {
      if (mockOrgs[id]) {
        mockOrgs[id].status = status;
        if (rejectionReason) {
          mockOrgs[id].rejectionReason = rejectionReason;
          mockOrgs[id].rejectedAt = new Date();
        }
        if (status === UserStatus.ACTIVE && !mockOrgs[id].trialEndsAt) {
          const trialEnd = new Date();
          trialEnd.setDate(trialEnd.getDate() + 14);
          mockOrgs[id].trialEndsAt = trialEnd;
        }
        if (status === UserStatus.PENDING) {
          mockOrgs[id].resubmittedAt = new Date();
        }
        if (!mockOrgs[id].statusHistory) mockOrgs[id].statusHistory = [];
        mockOrgs[id].statusHistory.push({ status, reason: rejectionReason, changedBy, changedAt: new Date() });
      }
    },
    searchOrganizations: async (query: string, page: number, limit: number, status?: string) => {
      let filtered = Object.values(mockOrgs);
      if (status) {
        filtered = filtered.filter(o => o.status.toUpperCase() === status.toUpperCase());
      }
      return {
        organizations: filtered.map(o => Organization.create(o)),
        total: filtered.length
      };
    }
  };

  const mockCollegeAdminRepo: any = {
    findById: async (id: string) => {
      const data = mockAdmins[id];
      return data ? CollegeAdmin.create(data) : null;
    },
    findByEmail: async (email: string) => {
      for (const admin of Object.values(mockAdmins)) {
        if (admin.email === email) return CollegeAdmin.create(admin);
      }
      return null;
    },
    findByOrgId: async (orgId: string) => {
      for (const admin of Object.values(mockAdmins)) {
        if (admin.orgId === orgId) return CollegeAdmin.create(admin);
      }
      return null;
    },
    update: async (id: string, entity: CollegeAdmin) => {
      mockAdmins[id] = { ...entity.toJSON(), id };
      return CollegeAdmin.create(mockAdmins[id]);
    },
    updateStatus: async (id: string, status: string) => {
      if (mockAdmins[id]) {
        mockAdmins[id].status = status;
      }
    }
  };

  const mockEmailService: any = {
    sendAccountApprovalEmail: async (email: string) => {
      sentEmails.push({ to: email, type: "APPROVAL" });
    },
    sendAccountRejectionEmail: async (email: string, name: string, reason: string) => {
      sentEmails.push({ to: email, type: "REJECTION", reason });
    }
  };

  const mockJwtService: any = {
    signAccessToken: () => "mock_access_token",
    signRefreshToken: () => "mock_refresh_token"
  };

  const mockBcryptService: any = {
    compare: async (plain: string, hash: string) => plain === "secret123" && hash === "hashed_secret123"
  };

  const updateUserStatusUseCase = new UpdateUserStatusUseCase(
    {} as any, // studentRepo
    mockOrgRepo,
    {} as any, // companyRepo
    {} as any, // hrRepo
    mockCollegeAdminRepo,
    mockEmailService
  );

  const mockSettingsRepo: any = {
    getSettings: async () => ({ requireApproval: true })
  };

  const updateCollegeOnboardingUseCase = new UpdateCollegeOnboardingUseCase(
    mockOrgRepo,
    mockCollegeAdminRepo,
    mockSettingsRepo
  );

  const loginCollegeAdminUseCase = new LoginCollegeAdminUseCase(
    mockCollegeAdminRepo,
    mockOrgRepo,
    mockJwtService,
    mockBcryptService
  );

  // Helper to reset test state
  function resetState() {
    mockOrgs = {
      "org-1": {
        id: "org-1",
        name: "Apex Engineering Institute",
        city: "Pune",
        state: "Maharashtra",
        status: UserStatus.PENDING,
        onboardingStep: 3,
        plan: "pro",
        activeBranches: ["Computer Science", "Information Technology"],
        placementContactEmail: "tpo@apex.edu",
        placementContactPhone: "9876543210"
      }
    };

    mockAdmins = {
      "admin-1": {
        id: "admin-1",
        firstName: "Rohan",
        lastName: "Deshmukh",
        email: "tpo@apex.edu",
        password: "hashed_secret123",
        orgId: "org-1",
        role: Role.COLLEGE_ADMIN,
        status: UserStatus.PENDING
      }
    };

    sentEmails = [];
  }

  // =========================================================================
  // Test 1: Super Admin Approves Pending Request
  // =========================================================================
  resetState();
  await updateUserStatusUseCase.execute(Role.COLLEGE_ADMIN, "org-1", "ACTIVE", Role.SUPER_ADMIN, undefined, "super-admin-1");
  assert(mockOrgs["org-1"].status === UserStatus.ACTIVE, "1.1: Super Admin can approve pending college request");
  assert(mockAdmins["admin-1"].status === UserStatus.ACTIVE, "1.2: College Admin user status becomes ACTIVE on approval");
  assert(mockOrgs["org-1"].trialEndsAt !== undefined, "1.3: 14-day trial date is configured on approval");
  assert(sentEmails.some(e => e.to === "tpo@apex.edu" && e.type === "APPROVAL"), "1.4: Account approval email is sent");

  // =========================================================================
  // Test 2: Super Admin Rejects Pending Request with Reason
  // =========================================================================
  resetState();
  await updateUserStatusUseCase.execute(
    Role.COLLEGE_ADMIN,
    "org-1",
    "REJECTED",
    Role.SUPER_ADMIN,
    "Please upload NAAC accreditation certificate and correct the institution address.",
    "super-admin-1"
  );
  assert(mockOrgs["org-1"].status === UserStatus.REJECTED, "2.1: Super Admin can reject pending college request");
  assert(mockAdmins["admin-1"].status === UserStatus.REJECTED, "2.2: College Admin user status becomes REJECTED");
  assert(
    mockOrgs["org-1"].rejectionReason === "Please upload NAAC accreditation certificate and correct the institution address.",
    "2.3: Rejection reason is persisted on the organization"
  );
  assert(mockOrgs["org-1"].rejectedAt !== undefined, "2.4: Rejection timestamp is recorded");
  assert(
    mockOrgs["org-1"].statusHistory.some((h: any) => h.status === UserStatus.REJECTED && h.reason.includes("NAAC")),
    "2.5: Status history records rejection decision and reason"
  );
  assert(sentEmails.some(e => e.to === "tpo@apex.edu" && e.type === "REJECTION"), "2.6: Rejection notification email is sent");

  // =========================================================================
  // Test 3: Rejection Requires Reason
  // =========================================================================
  resetState();
  let missingReasonError: any = null;
  try {
    await updateUserStatusUseCase.execute(Role.COLLEGE_ADMIN, "org-1", "REJECTED", Role.SUPER_ADMIN, "", "super-admin-1");
  } catch (err) {
    missingReasonError = err;
  }
  assert(
    missingReasonError instanceof AppError && missingReasonError.statusCode === HttpStatus.BAD_REQUEST,
    "3.1: Rejecting without a reason throws validation error"
  );

  // =========================================================================
  // Test 4: Unauthorized User Cannot Approve or Reject
  // =========================================================================
  resetState();
  let unauthorizedError: any = null;
  try {
    await updateUserStatusUseCase.execute(Role.COLLEGE_ADMIN, "org-1", "ACTIVE", Role.STUDENT, undefined, "student-1");
  } catch (err) {
    unauthorizedError = err;
  }
  assert(
    unauthorizedError instanceof AppError && unauthorizedError.statusCode === HttpStatus.FORBIDDEN,
    "4.1: Unauthorized role cannot approve college request"
  );

  // =========================================================================
  // Test 5: Invalid Transitions Handled Safely
  // =========================================================================
  // 5.1: Approving a rejected organization without resubmission is blocked
  resetState();
  mockOrgs["org-1"].status = UserStatus.REJECTED;
  mockAdmins["admin-1"].status = UserStatus.REJECTED;
  let approveRejectedError: any = null;
  try {
    await updateUserStatusUseCase.execute(Role.COLLEGE_ADMIN, "org-1", "ACTIVE", Role.SUPER_ADMIN, undefined, "super-admin-1");
  } catch (err) {
    approveRejectedError = err;
  }
  assert(
    approveRejectedError instanceof AppError && approveRejectedError.statusCode === HttpStatus.BAD_REQUEST,
    "5.1: Approving a rejected request without valid resubmission is blocked"
  );

  // 5.2: Rejecting an already approved organization through a stale review is blocked
  resetState();
  mockOrgs["org-1"].status = UserStatus.ACTIVE;
  mockAdmins["admin-1"].status = UserStatus.ACTIVE;
  let rejectApprovedError: any = null;
  try {
    await updateUserStatusUseCase.execute(Role.COLLEGE_ADMIN, "org-1", "REJECTED", Role.SUPER_ADMIN, "Stale rejection", "super-admin-1");
  } catch (err) {
    rejectApprovedError = err;
  }
  assert(
    rejectApprovedError instanceof AppError && rejectApprovedError.statusCode === HttpStatus.BAD_REQUEST,
    "5.2: Rejecting an already approved organization is blocked"
  );

  // =========================================================================
  // Test 6: Rejected College Admin Can Log In and View Rejection Reason
  // =========================================================================
  resetState();
  mockOrgs["org-1"].status = UserStatus.REJECTED;
  mockOrgs["org-1"].rejectionReason = "Incorrect university affiliation documents.";
  mockAdmins["admin-1"].status = UserStatus.REJECTED;

  const loginResult = await loginCollegeAdminUseCase.execute({
    email: "tpo@apex.edu",
    password: "secret123"
  });
  assert(loginResult.accessToken !== undefined, "6.1: Rejected college admin can authenticate and sign in");
  assert(loginResult.admin.status === UserStatus.REJECTED, "6.2: Status is returned as REJECTED");
  assert(
    loginResult.admin.rejectionReason === "Incorrect university affiliation documents.",
    "6.3: Rejection reason is returned in auth login response"
  );

  // =========================================================================
  // Test 7: College Refills Form and Resubmits for Review
  // =========================================================================
  // Correct form values
  const updatedData = {
    step: 1,
    name: "Apex Engineering Institute",
    city: "Pune",
    state: "Maharashtra",
    address: "Survey No 45, Katraj-Dehu Bypass, Pune 411046",
    naacGrade: "A+",
    website: "https://apex.edu.in"
  };
  await updateCollegeOnboardingUseCase.execute("org-1", updatedData as any);
  assert(mockOrgs["org-1"].address === "Survey No 45, Katraj-Dehu Bypass, Pune 411046", "7.1: College can update step 1 fields");

  // Resubmit for review
  const resubmitResult = await updateCollegeOnboardingUseCase.execute("org-1", {
    step: 3,
    plan: "pro",
    resubmit: true
  } as any);

  assert(mockOrgs["org-1"].status === UserStatus.PENDING, "7.2: Resubmission transitions status back to PENDING");
  assert(mockAdmins["admin-1"].status === UserStatus.PENDING, "7.3: College Admin user status transitions back to PENDING");
  assert(mockOrgs["org-1"].resubmittedAt !== undefined, "7.4: Resubmission timestamp is recorded");
  assert(
    mockOrgs["org-1"].statusHistory.some((h: any) => h.status === UserStatus.PENDING && h.reason.includes("Resubmitted")),
    "7.5: Status history records resubmission event"
  );
  assert(mockOrgs["org-1"].id === "org-1", "7.6: Reuses existing entity record without creating duplicates");

  // =========================================================================
  // Test 8: Super Admin Sees Resubmitted College in Pending Queue and Can Approve
  // =========================================================================
  const pendingOrgs = await mockOrgRepo.searchOrganizations("", 1, 10, "PENDING");
  assert(pendingOrgs.organizations.some((o: any) => o.id === "org-1"), "8.1: Resubmitted college appears in Super Admin pending queue");

  // Super admin can now approve the resubmitted request
  await updateUserStatusUseCase.execute(Role.COLLEGE_ADMIN, "org-1", "ACTIVE", Role.SUPER_ADMIN, undefined, "super-admin-1");
  assert(mockOrgs["org-1"].status === UserStatus.ACTIVE, "8.2: Super Admin successfully approves resubmitted college");

  // =========================================================================
  // Test 9: Resubmitting an Already Approved College is Blocked
  // =========================================================================
  let resubmitApprovedError: any = null;
  try {
    await updateCollegeOnboardingUseCase.execute("org-1", {
      step: 3,
      plan: "pro",
      resubmit: true
    } as any);
  } catch (err) {
    resubmitApprovedError = err;
  }
  assert(
    resubmitApprovedError instanceof AppError && resubmitApprovedError.statusCode === HttpStatus.BAD_REQUEST,
    "9.1: Resubmitting an already approved college is blocked"
  );

  console.log("==========================================================");
  console.log(`   TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("==========================================================");

  if (failed > 0) process.exit(1);
}

runTests().catch(err => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
