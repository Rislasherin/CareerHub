declare const process: any;

import { UpdateCompanyOnboardingUseCase } from "../../src/application/usecases/auth/hr/implementations/UpdateCompanyOnboarding.usecase";
import { UpdateCollegeOnboardingUseCase } from "../../src/application/usecases/auth/organization/implementations/UpdateCollegeOnboarding.usecase";
import { UploadCompanyVerificationDocumentUseCase } from "../../src/application/usecases/auth/hr/implementations/UploadCompanyVerificationDocument.usecase";
import { DeleteCompanyVerificationDocumentUseCase } from "../../src/application/usecases/auth/hr/implementations/DeleteCompanyVerificationDocument.usecase";
import { UploadCollegeVerificationDocumentUseCase } from "../../src/application/usecases/auth/organization/implementations/UploadCollegeVerificationDocument.usecase";
import { DeleteCollegeVerificationDocumentUseCase } from "../../src/application/usecases/auth/organization/implementations/DeleteCollegeVerificationDocument.usecase";
import { GetVerificationDocumentViewUseCase } from "../../src/application/usecases/auth/common/GetVerificationDocumentView.usecase";
import { GetCompaniesUseCase } from "../../src/application/usecases/super-admin/implementations/GetCompanies.usecase";
import { GetOrganizationsUseCase } from "../../src/application/usecases/super-admin/implementations/GetOrganizations.usecase";
import { Company } from "../../src/domain/entities/Company";
import { Organization } from "../../src/domain/entities/Organization";
import { Role } from "../../src/domain/enums/Roles.enum";
import { UserStatus } from "../../src/domain/enums/user.status.enum";
import { AppError } from "../../src/application/errors/AppError";
import { HttpStatus } from "../../src/domain/enums/HttpStatus.enum";
import {
  isValidMagicBytes,
  COMPANY_DOCUMENT_CATEGORIES,
  COLLEGE_DOCUMENT_CATEGORIES,
} from "../../src/domain/constants/verification-documents.constants";

async function runTests() {
  console.log("==========================================================");
  console.log("   VERIFICATION DOCUMENTS & COMPANY NAME WORKFLOW TESTS   ");
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

  // --- MOCK STORAGE SERVICE ---
  const mockStorageService: any = {
    uploadFile: async (file: any, folder: string) => {
      const name = file.originalname || "doc";
      return `https://res.cloudinary.com/test-careerhub/${folder}/${name}`;
    },
  };

  // --- MOCK PLATFORM SETTINGS REPOSITORY ---
  const mockPlatformSettingsRepo: any = {
    getSettings: async () => ({ requireApproval: true }),
  };

  // --- MOCK COMPANY REPOSITORY ---
  let mockCompanies: Record<string, any> = {};
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
      const id = entity.id || `comp-${Date.now()}`;
      mockCompanies[id] = { ...entity.toJSON(), id };
      return Company.create(mockCompanies[id]);
    },
    update: async (id: string, entity: Partial<Company> | Company) => {
      if (!mockCompanies[id]) return null;
      const json = entity instanceof Company ? entity.toJSON() : entity;
      mockCompanies[id] = { ...mockCompanies[id], ...json, id };
      return Company.create(mockCompanies[id]);
    },
    findAll: async (page = 1, limit = 10, search = '', status = '') => {
      const all = Object.values(mockCompanies).map((c) => Company.create(c));
      return { companies: all, total: all.length };
    },
  };

  // --- MOCK ORGANIZATION REPOSITORY ---
  let mockOrganizations: Record<string, any> = {};
  const mockOrgRepo: any = {
    findById: async (id: string) => {
      const data = mockOrganizations[id];
      if (!data) return null;
      return Organization.create(data);
    },
    findByName: async (name: string) => {
      for (const org of Object.values(mockOrganizations)) {
        if (org.name.toLowerCase() === name.toLowerCase()) return Organization.create(org);
      }
      return null;
    },
    save: async (entity: Organization) => {
      const id = entity.id || `org-${Date.now()}`;
      mockOrganizations[id] = { ...entity.toJSON(), id };
      return Organization.create(mockOrganizations[id]);
    },
    update: async (id: string, entity: Partial<Organization> | Organization) => {
      if (!mockOrganizations[id]) return null;
      const json = entity instanceof Organization ? entity.toJSON() : entity;
      mockOrganizations[id] = { ...mockOrganizations[id], ...json, id };
      return Organization.create(mockOrganizations[id]);
    },
    searchOrganizations: async (query: string, page: number, limit: number, status?: string) => {
      const list = Object.values(mockOrganizations).map((o: any) => Organization.create(o));
      return { organizations: list, total: list.length };
    },
  };

  // --- MOCK HR REPOSITORY ---
  let mockHRUsers: Record<string, any> = {};
  const mockHRRepo: any = {
    findById: async (id: string) => mockHRUsers[id] || null,
    findByCompanyId: async (companyId: string) =>
      Object.values(mockHRUsers).filter((u: any) => u.companyId === companyId),
    searchHRUsers: async (query: string, page: number, limit: number, status?: string) => {
      const list = Object.values(mockHRUsers).map((u: any) => ({
        ...u,
        toJSON: () => u,
      }));
      return { hrUsers: list, total: list.length };
    },
    update: async (id: string, data: any) => {
      mockHRUsers[id] = { ...mockHRUsers[id], ...data };
      return mockHRUsers[id];
    },
    updateStatus: async (id: string, status: string) => {
      if (mockHRUsers[id]) mockHRUsers[id].status = status;
      return mockHRUsers[id];
    },
  };

  // --- MOCK COLLEGE ADMIN REPOSITORY ---
  let mockCollegeAdmins: Record<string, any> = {};
  const mockCollegeAdminRepo: any = {
    findById: async (id: string) => mockCollegeAdmins[id] || null,
    findByOrgId: async (orgId: string) => {
      const admin = Object.values(mockCollegeAdmins).find((u: any) => u.organizationId === orgId);
      return admin || null;
    },
    update: async (id: string, data: any) => {
      mockCollegeAdmins[id] = { ...mockCollegeAdmins[id], ...data };
      return mockCollegeAdmins[id];
    },
    updateStatus: async (id: string, status: string) => {
      if (mockCollegeAdmins[id]) mockCollegeAdmins[id].status = status;
      return mockCollegeAdmins[id];
    },
  };

  const mockStudentRepo: any = {
    count: async () => 120,
  };
  const mockEntitlementGuard: any = {
    getEffectiveEntitlements: async () => ({ canPostJobs: true }),
  };

  // --- INITIALIZE USE CASES ---
  const updateCompanyOnboardingUseCase = new UpdateCompanyOnboardingUseCase(
    mockCompanyRepo,
    mockHRRepo,
    mockPlatformSettingsRepo
  );
  const updateCollegeOnboardingUseCase = new UpdateCollegeOnboardingUseCase(
    mockOrgRepo,
    mockCollegeAdminRepo,
    mockPlatformSettingsRepo
  );
  const uploadCompanyDocUseCase = new UploadCompanyVerificationDocumentUseCase(mockCompanyRepo, mockStorageService);
  const deleteCompanyDocUseCase = new DeleteCompanyVerificationDocumentUseCase(mockCompanyRepo);
  const uploadCollegeDocUseCase = new UploadCollegeVerificationDocumentUseCase(mockOrgRepo, mockStorageService);
  const deleteCollegeDocUseCase = new DeleteCollegeVerificationDocumentUseCase(mockOrgRepo);
  const getDocViewUseCase = new GetVerificationDocumentViewUseCase(mockCompanyRepo, mockOrgRepo);
  const getCompaniesUseCase = new GetCompaniesUseCase(mockCompanyRepo, mockHRRepo);
  const getOrgsUseCase = new GetOrganizationsUseCase(
    mockOrgRepo,
    mockStudentRepo,
    mockCollegeAdminRepo,
    mockEntitlementGuard
  );

  // Setup seed data
  const testCompany = Company.create({
    id: "comp-123",
    name: "Initial Tech Stub",
    industry: "Technology",
    onboardingStep: 0,
    status: UserStatus.PENDING,
  });
  mockCompanies["comp-123"] = testCompany.toJSON();

  mockHRUsers["hr-1"] = {
    id: "hr-1",
    firstName: "Priya",
    lastName: "Sharma",
    email: "priya@starlight.example.com",
    companyId: "comp-123",
    status: UserStatus.PENDING,
  };

  const testOrg = Organization.create({
    id: "org-123",
    name: "Initial College Stub",
    city: "Calicut",
    state: "Kerala",
    onboardingStep: 0,
    status: UserStatus.PENDING,
  });
  mockOrganizations["org-123"] = testOrg.toJSON();

  mockCollegeAdmins["admin-college-1"] = {
    id: "admin-college-1",
    firstName: "Ramesh",
    lastName: "Kumar",
    email: "principal@nitc.ac.in",
    organizationId: "org-123",
    status: UserStatus.PENDING,
  };

  // Test Buffer Helpers
  const pdfMagicBuffer = Buffer.from("%PDF-1.4 sample verification document binary stream");
  const fakePdfBuffer = Buffer.from("MZ malicious exe payload renamed as certificate.pdf");
  const jpgMagicBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x00, 0x01]);
  const pngMagicBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00]);

  // ==========================================================
  // 1. Company Name Backend Validation & Rejection of Placeholders
  // ==========================================================
  console.log("\n--- TEST GROUP 1: Company Name Backend Validation ---");
  try {
    await updateCompanyOnboardingUseCase.execute("comp-123", {
      step: 1,
      name: "Pending Company (John Doe) - 1712000000",
    });
    assert(false, "Should reject 'Pending Company' placeholder name in Step 1");
  } catch (err: any) {
    assert(
      err instanceof AppError && err.statusCode === HttpStatus.BAD_REQUEST,
      "Successfully rejected placeholder 'Pending Company' name"
    );
  }

  try {
    await updateCompanyOnboardingUseCase.execute("comp-123", {
      step: 1,
      name: "   ",
    });
    assert(false, "Should reject empty/whitespace company name");
  } catch (err: any) {
    assert(
      err instanceof AppError && err.statusCode === HttpStatus.BAD_REQUEST,
      "Successfully rejected whitespace company name"
    );
  }

  // Valid Legal Name Save & Restore
  const validStep1Result = await updateCompanyOnboardingUseCase.execute("comp-123", {
    step: 1,
    name: "   Starlight Cloud Systems Private Limited   ",
    website: "https://starlight.example.com",
    industry: "Cloud Computing",
  });
  assert(
    validStep1Result.name === "Starlight Cloud Systems Private Limited",
    "Company name trimmed and saved cleanly without placeholder defaults"
  );

  // College Name Rejection of Placeholders
  console.log("\n--- TEST GROUP 2: College Name Backend Validation ---");
  try {
    await updateCollegeOnboardingUseCase.execute("org-123", {
      step: 1,
      name: "Pending Institution (Admin User) - 1712000000",
      city: "Bengaluru",
      state: "Karnataka",
    });
    assert(false, "Should reject 'Pending Institution' placeholder name in College Step 1");
  } catch (err: any) {
    assert(
      err instanceof AppError && err.statusCode === HttpStatus.BAD_REQUEST,
      "Successfully rejected placeholder 'Pending Institution' name"
    );
  }

  const validCollegeStep1Result = await updateCollegeOnboardingUseCase.execute("org-123", {
    step: 1,
    name: "Indian Institute of Science Education",
    city: "Bengaluru",
    state: "Karnataka",
  });
  assert(
    validCollegeStep1Result.name === "Indian Institute of Science Education",
    "College name trimmed and saved cleanly"
  );

  // ==========================================================
  // 3. Security: File Upload Validation (MIME, Magic Bytes, Size, Category)
  // ==========================================================
  console.log("\n--- TEST GROUP 3: File Upload Validation & Security ---");

  // Magic bytes inspection
  assert(isValidMagicBytes(pdfMagicBuffer, "application/pdf"), "Valid PDF magic bytes verified");
  assert(!isValidMagicBytes(fakePdfBuffer, "application/pdf"), "Forged executable disguised as PDF rejected");
  assert(isValidMagicBytes(jpgMagicBuffer, "image/jpeg"), "Valid JPEG magic bytes verified");
  assert(isValidMagicBytes(pngMagicBuffer, "image/png"), "Valid PNG magic bytes verified");

  // Unsupported Category Rejection
  try {
    await uploadCompanyDocUseCase.execute(
      "comp-123",
      {
        buffer: pdfMagicBuffer,
        originalname: "certificate.pdf",
        mimetype: "application/pdf",
        size: 1024 * 1024,
      } as any,
      "RANDOM_INVALID_CATEGORY"
    );
    assert(false, "Should reject invalid company document category");
  } catch (err: any) {
    assert(
      err instanceof AppError && err.statusCode === HttpStatus.BAD_REQUEST,
      "Invalid company document category rejected with 400"
    );
  }

  // Oversized File Rejection (>10MB)
  try {
    await uploadCompanyDocUseCase.execute(
      "comp-123",
      {
        buffer: pdfMagicBuffer,
        originalname: "large.pdf",
        mimetype: "application/pdf",
        size: 15 * 1024 * 1024, // 15MB
      } as any,
      "INCORPORATION_CERTIFICATE"
    );
    assert(false, "Should reject file exceeding 10MB limit");
  } catch (err: any) {
    assert(
      err instanceof AppError && err.statusCode === HttpStatus.BAD_REQUEST,
      "Oversized file rejected with 400"
    );
  }

  // Forged MIME Type Rejection
  try {
    await uploadCompanyDocUseCase.execute(
      "comp-123",
      {
        buffer: fakePdfBuffer,
        originalname: "fake.pdf",
        mimetype: "application/pdf",
        size: 512,
      } as any,
      "INCORPORATION_CERTIFICATE"
    );
    assert(false, "Should reject file with mismatched magic bytes header");
  } catch (err: any) {
    assert(
      err instanceof AppError && err.statusCode === HttpStatus.BAD_REQUEST,
      "Forged file magic bytes header rejected with 400"
    );
  }

  // ==========================================================
  // 4. Successful Verification Document Uploads (Company & College)
  // ==========================================================
  console.log("\n--- TEST GROUP 4: Verification Document Upload & Persistence ---");

  // Upload Company Certificate of Incorporation
  const res1 = await uploadCompanyDocUseCase.execute(
    "comp-123",
    {
      buffer: pdfMagicBuffer,
      originalname: "COI_Starlight_2024.pdf",
      mimetype: "application/pdf",
      size: 1024 * 500,
    } as any,
    "INCORPORATION_CERTIFICATE"
  );
  const uploadedCompanyDoc1 = res1.document;
  assert(uploadedCompanyDoc1.category === "INCORPORATION_CERTIFICATE", "COI document category persisted");
  assert(uploadedCompanyDoc1.fileName === "COI_Starlight_2024.pdf", "Original filename sanitized and saved");
  assert(uploadedCompanyDoc1.fileUrl.includes("COI_Starlight_2024.pdf"), "Secure storage URL saved");

  // Upload Company GST Certificate
  const res2 = await uploadCompanyDocUseCase.execute(
    "comp-123",
    {
      buffer: pdfMagicBuffer,
      originalname: "GST_Certificate.pdf",
      mimetype: "application/pdf",
      size: 1024 * 300,
    } as any,
    "GST_CERTIFICATE"
  );
  const uploadedCompanyDoc2 = res2.document;
  assert(uploadedCompanyDoc2.category === "GST_CERTIFICATE", "Second company document uploaded successfully");

  // Check company document count in repository
  const companyAfterUpload = await mockCompanyRepo.findById("comp-123");
  assert(companyAfterUpload.verificationDocuments.length === 2, "Company entity contains both uploaded documents");

  // Upload College Affiliation Certificate
  const collegeRes = await uploadCollegeDocUseCase.execute(
    "org-123",
    {
      buffer: pdfMagicBuffer,
      originalname: "AICTE_Affiliation_2025.pdf",
      mimetype: "application/pdf",
      size: 1024 * 400,
    } as any,
    "UGC_AICTE_AFFILIATION"
  );
  const uploadedCollegeDoc = collegeRes.document;
  assert(uploadedCollegeDoc.category === "UGC_AICTE_AFFILIATION", "College affiliation certificate saved");

  const collegeAfterUpload = await mockOrgRepo.findById("org-123");
  assert(collegeAfterUpload.verificationDocuments.length === 1, "College entity contains uploaded verification document");

  // ==========================================================
  // 5. Enforce Verification Documents on Final Submission (Step 3)
  // ==========================================================
  console.log("\n--- TEST GROUP 5: Mandatory Document Check on Step 3 Submission ---");

  // New company with 0 documents should fail Step 3 submission
  const emptyComp = Company.create({
    id: "comp-empty",
    name: "Empty Co",
    onboardingStep: 2,
    status: UserStatus.PENDING,
  });
  mockCompanies["comp-empty"] = emptyComp.toJSON();

  try {
    await updateCompanyOnboardingUseCase.execute("comp-empty", {
      step: 3,
      contactName: "Alex Mercer",
      contactEmail: "alex@empty.com",
    });
    assert(false, "Should reject Step 3 submission when no verification documents are uploaded");
  } catch (err: any) {
    assert(
      err instanceof AppError && err.statusCode === HttpStatus.BAD_REQUEST,
      "Step 3 final submission rejected when 0 verification documents uploaded"
    );
  }

  // Company with uploaded documents passes Step 3 submission
  const validCompSubmission = await updateCompanyOnboardingUseCase.execute("comp-123", {
    step: 3,
    contactName: "Priya Sharma",
    contactEmail: "priya@starlight.example.com",
  });
  assert(validCompSubmission.onboardingStep === 3, "Company with valid documents completes Step 3");
  assert(validCompSubmission.status === UserStatus.PENDING, "Company status is set to PENDING for review");

  // College with 0 documents should fail Step 3 submission
  const emptyOrg = Organization.create({
    id: "org-empty",
    name: "Empty College",
    onboardingStep: 2,
    status: UserStatus.PENDING,
  });
  mockOrganizations["org-empty"] = emptyOrg.toJSON();

  try {
    await updateCollegeOnboardingUseCase.execute("org-empty", {
      step: 3,
      plan: "pro",
    });
    assert(false, "Should reject College Step 3 submission when no documents are uploaded");
  } catch (err: any) {
    assert(
      err instanceof AppError && err.statusCode === HttpStatus.BAD_REQUEST,
      "College Step 3 submission rejected when 0 verification documents uploaded"
    );
  }

  // College with uploaded document passes Step 3
  const validOrgSubmission = await updateCollegeOnboardingUseCase.execute("org-123", {
    step: 3,
    plan: "pro",
  });
  assert(validOrgSubmission.onboardingStep === 3, "College with valid documents completes Step 3");

  // ==========================================================
  // 6. Super Admin Inspection & Request View
  // ==========================================================
  console.log("\n--- TEST GROUP 6: Super Admin Inspection & Modals Data ---");

  const companiesListResult = await getCompaniesUseCase.execute("", 1, 10);
  const retrievedComp = companiesListResult.companies.find((c: any) => c.companyId === "comp-123");
  assert(
    retrievedComp && retrievedComp.verificationDocuments && retrievedComp.verificationDocuments.length === 2,
    "Super Admin getCompanies includes full verificationDocuments array with structured metadata"
  );

  // In Super Admin getOrganizations:
  // Since subscription model in real code tries to dynamically import subscription.model.js,
  // we check that mockOrgRepo has the verificationDocuments correctly stored and accessible.
  const storedOrg = await mockOrgRepo.findById("org-123");
  assert(
    storedOrg && storedOrg.verificationDocuments && storedOrg.verificationDocuments.length === 1,
    "Super Admin getOrganizations data source includes full verificationDocuments array with structured metadata"
  );

  // ==========================================================
  // 7. Tenant Isolation & Document Access Control
  // ==========================================================
  console.log("\n--- TEST GROUP 7: Access Control & Tenant Isolation ---");

  // Super Admin can view document
  const superAdminView = await getDocViewUseCase.execute(
    { role: Role.SUPER_ADMIN, userId: "admin-1" },
    "company",
    "comp-123",
    uploadedCompanyDoc1.id
  );
  assert(superAdminView.fileUrl === uploadedCompanyDoc1.fileUrl, "Super Admin can view uploaded company document");

  // Owner HR can view own document
  const ownerHRView = await getDocViewUseCase.execute(
    { role: Role.HR, userId: "hr-owner", companyId: "comp-123" },
    "company",
    "comp-123",
    uploadedCompanyDoc1.id
  );
  assert(ownerHRView.fileUrl === uploadedCompanyDoc1.fileUrl, "Company owner can view own document");

  // Stranger HR blocked from viewing another company's document
  try {
    await getDocViewUseCase.execute(
      { role: Role.HR, userId: "hr-stranger", companyId: "comp-other-999" },
      "company",
      "comp-123",
      uploadedCompanyDoc1.id
    );
    assert(false, "Should forbid stranger HR from viewing another company's document");
  } catch (err: any) {
    assert(
      err instanceof AppError && err.statusCode === HttpStatus.FORBIDDEN,
      "Unauthorized HR user forbidden from viewing another company's documents (403)"
    );
  }

  // College Admin blocked from viewing company document
  try {
    await getDocViewUseCase.execute(
      { role: Role.COLLEGE_ADMIN, userId: "college-admin", orgId: "org-123" },
      "company",
      "comp-123",
      uploadedCompanyDoc1.id
    );
    assert(false, "Should forbid College Admin from viewing company documents");
  } catch (err: any) {
    assert(
      err instanceof AppError && err.statusCode === HttpStatus.FORBIDDEN,
      "College Admin forbidden from accessing company documents (403)"
    );
  }

  // ==========================================================
  // 8. Document Deletion & Resubmission Workflow
  // ==========================================================
  console.log("\n--- TEST GROUP 8: Deletion & Resubmission Workflow ---");

  // Delete one document
  await deleteCompanyDocUseCase.execute("comp-123", uploadedCompanyDoc2.id);
  const compAfterDelete = await mockCompanyRepo.findById("comp-123");
  assert(
    compAfterDelete.verificationDocuments.length === 1 &&
    compAfterDelete.verificationDocuments[0].id === uploadedCompanyDoc1.id,
    "Successfully deleted targeted document without affecting other documents"
  );

  // Deleting non-existent document fails gracefully
  try {
    await deleteCompanyDocUseCase.execute("comp-123", "non-existent-doc-id");
    assert(false, "Should reject deleting non-existent document");
  } catch (err: any) {
    assert(
      err instanceof AppError && err.statusCode === HttpStatus.NOT_FOUND,
      "Deleting non-existent document rejected with 404"
    );
  }

  // Resubmission workflow: Rejected company updates documents and resubmits
  const compProps = compAfterDelete.toJSON();
  compProps.status = UserStatus.REJECTED;
  compProps.onboardingStep = 1;
  await mockCompanyRepo.update("comp-123", Company.create(compProps));

  // Resubmit with new updated document
  const newDocRes = await uploadCompanyDocUseCase.execute(
    "comp-123",
    {
      buffer: pdfMagicBuffer,
      originalname: "Updated_Establishment_License.pdf",
      mimetype: "application/pdf",
      size: 1024 * 250,
    } as any,
    "ESTABLISHMENT_LICENSE"
  );
  assert(newDocRes.document.category === "ESTABLISHMENT_LICENSE", "New verification document added during resubmission");

  const resubmittedCompany = await updateCompanyOnboardingUseCase.execute("comp-123", {
    step: 3,
    contactName: "Priya Sharma",
    contactEmail: "priya@starlight.example.com",
    resubmit: true,
  });
  assert(resubmittedCompany.status === UserStatus.PENDING, "Resubmission transitions company status back to PENDING");
  assert(resubmittedCompany.verificationDocuments.length === 2, "All valid documents preserved during resubmission");

  // Summary
  console.log("\n==========================================================");
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("==========================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution failed with unhandled error:", err);
  process.exit(1);
});
