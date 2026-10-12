declare const process: any;

import { UpdateUserStatusUseCase } from "../../src/application/usecases/super-admin/implementations/UpdateUserStatus.usecase";
import { UpdateCompanyOnboardingUseCase } from "../../src/application/usecases/auth/hr/implementations/UpdateCompanyOnboarding.usecase";
import { LoginHRUseCase } from "../../src/application/usecases/auth/hr/implementations/LoginHR.usecase";
import { GetCompaniesUseCase } from "../../src/application/usecases/super-admin/implementations/GetCompanies.usecase";
import { Company } from "../../src/domain/entities/Company";
import { HRUser } from "../../src/domain/entities/HRUser";
import { Role } from "../../src/domain/enums/Roles.enum";
import { UserStatus } from "../../src/domain/enums/user.status.enum";
import { AppError } from "../../src/application/errors/AppError";
import { HttpStatus } from "../../src/domain/enums/HttpStatus.enum";

async function runTests() {
  console.log("==========================================================");
  console.log("   COMPANY APPROVAL, REJECTION & RESUBMISSION TESTS       ");
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

  // In-memory mock repositories
  let mockCompanies: Record<string, any> = {};
  let mockHRUsers: Record<string, any> = {};
  let sentEmails: Array<{ to: string; type: string; reason?: string }> = [];

  const mockCompanyRepo: any = {
    findById: async (id: string) => {
      const data = mockCompanies[id];
      if (!data) return null;
      return Company.create(data);
    },
    findByName: async (name: string) => {
      for (const comp of Object.values(mockCompanies)) {
        if (comp.name.toLowerCase() === name.toLowerCase()) return Company.create(comp);
      }
      return null;
    },
    save: async (entity: Company) => {
      const id = entity.id || String(Date.now());
      mockCompanies[id] = { ...entity.toJSON(), id };
      return Company.create(mockCompanies[id]);
    },
    update: async (id: string, entity: Partial<Company> | Company) => {
      if (!mockCompanies[id]) return null;
      const json = entity instanceof Company ? entity.toJSON() : entity;
      mockCompanies[id] = { ...mockCompanies[id], ...json, id };
      return Company.create(mockCompanies[id]);
    },
    updateStatus: async (id: string, status: string, blockedBy?: string, rejectionReason?: string, changedBy?: string) => {
      if (mockCompanies[id]) {
        mockCompanies[id].status = status;
        if (rejectionReason) {
          mockCompanies[id].rejectionReason = rejectionReason;
          mockCompanies[id].rejectedAt = new Date();
        }
        if (status === UserStatus.ACTIVE || status === 'ACTIVE') {
          mockCompanies[id].approvedAt = new Date();
        }
        if (status === UserStatus.PENDING || status === 'PENDING') {
          mockCompanies[id].resubmittedAt = new Date();
        }
        if (!mockCompanies[id].statusHistory) mockCompanies[id].statusHistory = [];
        mockCompanies[id].statusHistory.push({ status, reason: rejectionReason, changedBy, changedAt: new Date() });
      }
    },
    searchCompanies: async ({ query, status, page = 1, limit = 10 }: any) => {
      let list = Object.values(mockCompanies);
      if (status && status !== 'ALL') {
        list = list.filter((c: any) => c.status === status);
      }
      if (query) {
        list = list.filter((c: any) => c.name.toLowerCase().includes(query.toLowerCase()));
      }
      return {
        companies: list.map((c: any) => Company.create(c)),
        total: list.length,
        totalPages: Math.ceil(list.length / limit)
      };
    }
  };

  const mockHRUserRepo: any = {
    findById: async (id: string) => {
      const data = mockHRUsers[id];
      if (!data) return null;
      return HRUser.create(data);
    },
    findByEmail: async (email: string) => {
      for (const u of Object.values(mockHRUsers)) {
        if (u.email.toLowerCase() === email.toLowerCase()) return HRUser.create(u);
      }
      return null;
    },
    findByCompanyId: async (companyId: string) => {
      return Object.values(mockHRUsers)
        .filter((u: any) => u.companyId === companyId)
        .map((u: any) => HRUser.create(u));
    },
    save: async (entity: HRUser) => {
      const id = entity.id || String(Date.now());
      mockHRUsers[id] = { ...entity.toJSON(), id };
      return HRUser.create(mockHRUsers[id]);
    },
    update: async (id: string, entity: Partial<HRUser> | HRUser) => {
      if (!mockHRUsers[id]) return null;
      const json = entity instanceof HRUser ? entity.toJSON() : entity;
      mockHRUsers[id] = { ...mockHRUsers[id], ...json, id };
      return HRUser.create(mockHRUsers[id]);
    },
    updateStatus: async (id: string, status: string, rejectionReason?: string) => {
      if (mockHRUsers[id]) {
        mockHRUsers[id].status = status;
        if (rejectionReason) {
          mockHRUsers[id].rejectionReason = rejectionReason;
        }
      }
    },
    searchHRUsers: async (query: string, page: number = 1, limit: number = 10, status?: string) => {
      let list = Object.values(mockHRUsers);
      if (status && status !== 'ALL') {
        list = list.filter((u: any) => u.status === status);
      }
      if (query) {
        list = list.filter((u: any) => 
          u.firstName?.toLowerCase().includes(query.toLowerCase()) ||
          u.lastName?.toLowerCase().includes(query.toLowerCase()) ||
          u.email?.toLowerCase().includes(query.toLowerCase())
        );
      }
      return {
        hrUsers: list.map((u: any) => HRUser.create(u)),
        total: list.length
      };
    }
  };

  const mockEmailService: any = {
    sendAccountApprovalEmail: async (to: string, name: string) => {
      sentEmails.push({ to, type: "APPROVAL" });
    },
    sendAccountRejectionEmail: async (to: string, name: string, reason: string) => {
      sentEmails.push({ to, type: "REJECTION", reason });
    }
  };

  const mockHashService: any = {
    compare: async (plain: string, hashed: string) => plain === hashed || hashed === "hashed_secret"
  };

  const mockTokenService: any = {
    signAccessToken: () => "mock-access-token",
    signRefreshToken: () => "mock-refresh-token",
    generateAccessToken: () => "mock-access-token",
    generateRefreshToken: () => "mock-refresh-token"
  };

  const mockPlatformSettingsRepo: any = {
    getSettings: async () => ({
      allowedDomains: ["gmail.com", "techcorp.com", "acme.com"],
      maxHiringPerCompany: 50
    })
  };

  // Seed data
  const company1Id = "comp-101";
  const hrUser1Id = "hr-201";

  mockCompanies[company1Id] = {
    id: company1Id,
    name: "TechCorp Global",
    website: "https://techcorp.com",
    industry: "Information Technology",
    size: "50-200",
    location: "Bengaluru, India",
    description: "Enterprise Cloud & AI Solutions",
    contactName: "Alex Morgan",
    contactEmail: "alex@techcorp.com",
    contactPhone: "+91 9876543210",
    contactJobTitle: "Lead Talent Partner",
    verificationDocument: "https://documents.careerhub.internal/verif/techcorp_incorporation.pdf",
    status: UserStatus.PENDING,
    onboardingStep: 3,
    createdAt: new Date("2026-10-01T10:00:00Z"),
    statusHistory: []
  };

  mockHRUsers[hrUser1Id] = {
    id: hrUser1Id,
    firstName: "Alex",
    lastName: "Morgan",
    email: "alex@techcorp.com",
    password: "hashed_secret",
    role: Role.HR,
    companyId: company1Id,
    status: UserStatus.PENDING,
    createdAt: new Date("2026-10-01T10:00:00Z")
  };

  // Instantiating use cases
  // Constructor order: studentRepo, orgRepo, companyRepo, hrRepo, collegeAdminRepo, emailService
  const updateUserStatusUseCase = new UpdateUserStatusUseCase(
    {} as any, // student
    {} as any, // org
    mockCompanyRepo,
    mockHRUserRepo,
    {} as any, // collegeAdmin
    mockEmailService
  );

  const loginHRUseCase = new LoginHRUseCase(
    mockHRUserRepo,
    mockCompanyRepo,
    mockTokenService,
    mockHashService
  );

  const updateCompanyOnboardingUseCase = new UpdateCompanyOnboardingUseCase(
    mockCompanyRepo,
    mockHRUserRepo,
    mockPlatformSettingsRepo
  );

  const getCompaniesUseCase = new GetCompaniesUseCase(
    mockCompanyRepo,
    mockHRUserRepo
  );

  // ----------------------------------------------------
  // TEST SUITE 1: Super Admin View Details and Persistence
  // ----------------------------------------------------
  console.log("\n--- Suite 1: Super Admin View Details Query ---");
  {
    const listing = await getCompaniesUseCase.execute("", 1, 10, 'ALL');
    assert(listing.companies.length === 1, "1.1: GetCompaniesUseCase returns persisted company listing");
    const item = listing.companies[0];
    assert(item.companyName === "TechCorp Global" || item.name === "TechCorp Global", "1.2: Returns persisted company name");
    assert(item.industry === "Information Technology", "1.3: Returns persisted industry");
    assert(item.size === "50-200", "1.4: Returns company size");
    assert(item.website === "https://techcorp.com", "1.5: Returns company website");
    assert(item.verificationDocument === "https://documents.careerhub.internal/verif/techcorp_incorporation.pdf", "1.6: Returns verification document link");
    assert(item.contactEmail === "alex@techcorp.com", "1.7: Returns contact email");
  }

  // ----------------------------------------------------
  // TEST SUITE 2: Super Admin Rejection Workflow with Reason
  // ----------------------------------------------------
  console.log("\n--- Suite 2: Super Admin Rejection Workflow ---");
  {
    // 2.1: Rejection requires non-empty reason
    let rejectedWithoutReasonError: any = null;
    try {
      await updateUserStatusUseCase.execute(
        Role.HR,
        hrUser1Id,
        UserStatus.REJECTED,
        Role.SUPER_ADMIN,
        "   ", // empty/whitespace
        "superadmin-1"
      );
    } catch (err: any) {
      rejectedWithoutReasonError = err;
    }
    assert(
      rejectedWithoutReasonError instanceof AppError && rejectedWithoutReasonError.statusCode === HttpStatus.BAD_REQUEST,
      "2.1: Rejection requires a non-empty reason and throws 400 Bad Request if missing"
    );

    // 2.2: Rejection with valid reason
    sentEmails = [];
    await updateUserStatusUseCase.execute(
      Role.HR,
      hrUser1Id,
      UserStatus.REJECTED,
      Role.SUPER_ADMIN,
      "Certificate of Incorporation is expired. Please upload a valid document.",
      "superadmin-1"
    );

    assert(mockCompanies[company1Id].status === UserStatus.REJECTED, "2.2: Company status updated to REJECTED");
    assert(mockHRUsers[hrUser1Id].status === UserStatus.REJECTED, "2.3: HR user status updated to REJECTED");
    assert(mockCompanies[company1Id].rejectionReason === "Certificate of Incorporation is expired. Please upload a valid document.", "2.4: Rejection reason persisted on Company");
    assert(mockCompanies[company1Id].rejectedAt instanceof Date, "2.5: Rejection timestamp recorded");
    assert(mockCompanies[company1Id].statusHistory?.length === 1, "2.6: Status history recorded rejection");
    assert(mockCompanies[company1Id].statusHistory[0].reason?.includes("Certificate of Incorporation"), "2.7: Status history includes rejection reason");
    assert(sentEmails.some(e => e.type === "REJECTION" && e.to === "alex@techcorp.com"), "2.8: Rejection email notification sent to HR");
  }

  // ----------------------------------------------------
  // TEST SUITE 3: Role Authorization Enforcement
  // ----------------------------------------------------
  console.log("\n--- Suite 3: Role Authorization & Security ---");
  {
    let authError: any = null;
    try {
      await updateUserStatusUseCase.execute(
        Role.HR,
        hrUser1Id,
        UserStatus.ACTIVE,
        Role.COLLEGE_ADMIN, // Unauthorized role
        undefined,
        "collegeadmin-1"
      );
    } catch (err: any) {
      authError = err;
    }
    assert(
      authError instanceof AppError && authError.statusCode === HttpStatus.FORBIDDEN,
      "3.1: Non-Super-Admin roles (e.g. College Admin) are blocked with 403 Forbidden"
    );
  }

  // ----------------------------------------------------
  // TEST SUITE 4: State Transition Safety Rules
  // ----------------------------------------------------
  console.log("\n--- Suite 4: State Transition Invariants ---");
  {
    // Cannot approve a REJECTED company without resubmission
    let transitionError: any = null;
    try {
      await updateUserStatusUseCase.execute(
        Role.HR,
        hrUser1Id,
        UserStatus.ACTIVE,
        Role.SUPER_ADMIN,
        undefined,
        "superadmin-1"
      );
    } catch (err: any) {
      transitionError = err;
    }
    assert(
      transitionError instanceof AppError && transitionError.statusCode === HttpStatus.BAD_REQUEST,
      "4.1: Direct approval of a REJECTED company without resubmission is blocked (400 Bad Request)"
    );

    // Cannot reject an ACTIVE company
    mockCompanies[company1Id].status = UserStatus.ACTIVE;
    mockHRUsers[hrUser1Id].status = UserStatus.ACTIVE;
    let activeRejectError: any = null;
    try {
      await updateUserStatusUseCase.execute(
        Role.HR,
        hrUser1Id,
        UserStatus.REJECTED,
        Role.SUPER_ADMIN,
        "Test reject active",
        "superadmin-1"
      );
    } catch (err: any) {
      activeRejectError = err;
    }
    assert(
      activeRejectError instanceof AppError && activeRejectError.statusCode === HttpStatus.BAD_REQUEST,
      "4.2: Direct rejection of an already ACTIVE company is blocked (use BLOCK instead)"
    );

    // Reset back to REJECTED for the next test suite
    mockCompanies[company1Id].status = UserStatus.REJECTED;
    mockHRUsers[hrUser1Id].status = UserStatus.REJECTED;
  }

  // ----------------------------------------------------
  // TEST SUITE 5: HR Login with REJECTED Status
  // ----------------------------------------------------
  console.log("\n--- Suite 5: HR Login with REJECTED Status ---");
  {
    const loginResult = await loginHRUseCase.execute({
      email: "alex@techcorp.com",
      password: "hashed_secret"
    });

    assert(loginResult.hrUser.status === UserStatus.REJECTED, "5.1: Rejected HR user can authenticate successfully");
    assert(loginResult.company.status === UserStatus.REJECTED, "5.2: Company status is returned as REJECTED");
    assert(loginResult.company.rejectionReason?.includes("Certificate of Incorporation"), "5.3: Rejection reason returned to frontend for feedback banner");
    assert(loginResult.accessToken.length > 0, "5.4: Access token issued to allow visiting onboarding resubmission");
  }

  // ----------------------------------------------------
  // TEST SUITE 6: Form Refill and Resubmission Workflow
  // ----------------------------------------------------
  console.log("\n--- Suite 6: Resubmission from REJECTED to PENDING ---");
  {
    const initialCompanyCount = Object.keys(mockCompanies).length;
    const initialHRCount = Object.keys(mockHRUsers).length;

    // Resubmit with updated verification document and headquarters
    const resubmitRes = await updateCompanyOnboardingUseCase.execute(company1Id, {
      step: 3,
      name: "TechCorp Global",
      website: "https://techcorp.com",
      industry: "Information Technology",
      size: "50-200",
      headquarters: "Bengaluru, Karnataka, India - Updated HQ",
      description: "Enterprise Cloud & AI Solutions (Updated)",
      contactName: "Alex Morgan",
      contactEmail: "alex@techcorp.com",
      contactPhone: "+91 9876543210",
      verificationDocument: "https://documents.careerhub.internal/verif/techcorp_incorporation_v2_valid.pdf",
      resubmit: true
    });

    assert(resubmitRes.status === UserStatus.PENDING, "6.1: Company status transitions back to PENDING upon resubmission");
    assert(mockCompanies[company1Id].status === UserStatus.PENDING, "6.2: Persisted company status is PENDING");
    assert(mockHRUsers[hrUser1Id].status === UserStatus.PENDING, "6.3: Associated HR user status transitions back to PENDING");
    assert(mockCompanies[company1Id].resubmittedAt instanceof Date, "6.4: Resubmission timestamp is recorded");
    assert(mockCompanies[company1Id].verificationDocument === "https://documents.careerhub.internal/verif/techcorp_incorporation_v2_valid.pdf", "6.5: Updated verification document persisted");
    assert(mockCompanies[company1Id].headquarters === "Bengaluru, Karnataka, India - Updated HQ", "6.6: Updated headquarters persisted");
    assert(Object.keys(mockCompanies).length === initialCompanyCount, "6.7: Reuses existing company record without duplicates");
    assert(Object.keys(mockHRUsers).length === initialHRCount, "6.8: Reuses existing HR user record without duplicates");
    assert(mockCompanies[company1Id].statusHistory?.length === 2, "6.9: Status history tracks resubmission event");
  }

  // ----------------------------------------------------
  // TEST SUITE 7: Super Admin Re-Review and Approval
  // ----------------------------------------------------
  console.log("\n--- Suite 7: Super Admin Re-Review & Final Approval ---");
  {
    // 7.1: Company appears in pending review queue
    const pendingSearch = await mockCompanyRepo.searchCompanies({ status: UserStatus.PENDING });
    assert(pendingSearch.companies.some((c: any) => c.id === company1Id), "7.1: Resubmitted company is present in PENDING queue");

    // 7.2: Super Admin approves resubmitted request
    sentEmails = [];
    await updateUserStatusUseCase.execute(
      Role.HR,
      hrUser1Id,
      UserStatus.ACTIVE,
      Role.SUPER_ADMIN,
      undefined,
      "superadmin-1"
    );

    assert(mockCompanies[company1Id].status === UserStatus.ACTIVE, "7.2: Company status updated to ACTIVE");
    assert(mockHRUsers[hrUser1Id].status === UserStatus.ACTIVE, "7.3: HR user status updated to ACTIVE");
    assert(mockCompanies[company1Id].approvedAt instanceof Date, "7.4: Approval timestamp recorded");
    assert(mockCompanies[company1Id].statusHistory?.length === 3, "7.5: Status history records approval event");
    assert(sentEmails.some(e => e.type === "APPROVAL" && e.to === "alex@techcorp.com"), "7.6: Approval confirmation email sent to company HR");
  }

  // ----------------------------------------------------
  // TEST SUITE 8: Invariant - Prevent Resubmitting ACTIVE Company
  // ----------------------------------------------------
  console.log("\n--- Suite 8: Invariant - Prevent Resubmission of ACTIVE Company ---");
  {
    let activeResubmitError: any = null;
    try {
      await updateCompanyOnboardingUseCase.execute(company1Id, {
        step: 3,
        name: "TechCorp Global",
        resubmit: true
      });
    } catch (err: any) {
      activeResubmitError = err;
    }
    assert(
      activeResubmitError instanceof AppError && activeResubmitError.statusCode === HttpStatus.BAD_REQUEST,
      "8.1: Resubmitting an already approved/ACTIVE company is blocked (400 Bad Request)"
    );
  }

  // ----------------------------------------------------
  // TEST SUITE 9: Resolution by Company ID directly
  // ----------------------------------------------------
  console.log("\n--- Suite 9: Resolution via Company ID directly ---");
  {
    // Test that UpdateUserStatusUseCase works when userId passed is the company ID directly
    mockCompanies[company1Id].status = UserStatus.PENDING;
    mockHRUsers[hrUser1Id].status = UserStatus.PENDING;

    await updateUserStatusUseCase.execute(
      "company",
      company1Id,
      UserStatus.ACTIVE,
      Role.SUPER_ADMIN,
      undefined,
      "superadmin-1"
    );

    assert(mockCompanies[company1Id].status === UserStatus.ACTIVE, "9.1: Super Admin can approve passing companyId directly");
    assert(mockHRUsers[hrUser1Id].status === UserStatus.ACTIVE, "9.2: Linked HR user status is ACTIVE");
  }

  console.log("\n==========================================================");
  console.log(`   TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("==========================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution failed with error:", err);
  process.exit(1);
});
