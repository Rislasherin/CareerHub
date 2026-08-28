declare const process: any;

import { GetSuperAdminProfileUseCase } from "../../src/application/usecases/super-admin/implementations/GetSuperAdminProfileUseCase";
import { UpdateSuperAdminProfileUseCase } from "../../src/application/usecases/super-admin/implementations/UpdateSuperAdminProfileUseCase";
import { ChangeSuperAdminPasswordUseCase } from "../../src/application/usecases/super-admin/implementations/ChangeSuperAdminPasswordUseCase";
import { RequestSuperAdminEmailChangeUseCase } from "../../src/application/usecases/super-admin/implementations/RequestSuperAdminEmailChangeUseCase";
import { VerifySuperAdminEmailChangeUseCase } from "../../src/application/usecases/super-admin/implementations/VerifySuperAdminEmailChangeUseCase";
import { SuperAdmin } from "../../src/domain/entities/SuperAdmin";
import { Role } from "../../src/domain/enums/Roles.enum";
import { UserStatus } from "../../src/domain/enums/user.status.enum";

async function runTests() {
  console.log("==========================================================");
  console.log("      SUPER ADMIN SETTINGS USE CASES UNIT TESTS           ");
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

  // 1. Setup mock data
  const mockAdminData = {
    id: "admin-123",
    firstName: "Arjun",
    lastName: "Mehta",
    email: "admin@careerhub.io",
    password: "hashed_current_password",
    role: Role.SUPER_ADMIN,
    status: UserStatus.ACTIVE
  };

  let updatedAdminEntity: any = null;

  // Mock repositories
  const mockSuperAdminRepo: any = {
    findById: async (id: string) => {
      if (id === "admin-123") {
        return SuperAdmin.create(mockAdminData);
      }
      return null;
    },
    update: async (id: string, entity: SuperAdmin) => {
      updatedAdminEntity = entity;
      return entity;
    }
  };

  const mockBcryptService: any = {
    compare: async (plain: string, hashed: string) => {
      return plain === "current_password_123" && hashed === "hashed_current_password";
    },
    hash: async (plain: string) => {
      return `hashed_${plain}`;
    }
  };

  const mockOtpRepository: any = {
    otps: {} as { [key: string]: string },
    create: async (email: string, otp: string) => {
      mockOtpRepository.otps[email] = otp;
    },
    findByEmailAndOtp: async (email: string, otp: string) => {
      if (mockOtpRepository.otps[email] === otp) {
        return { email, otp };
      }
      return null;
    },
    deleteByEmail: async (email: string) => {
      delete mockOtpRepository.otps[email];
    }
  };

  let emailSentTo = "";
  let emailOtp = "";
  const mockEmailService: any = {
    sendOTP: async (email: string, otp: string, subject: string) => {
      emailSentTo = email;
      emailOtp = otp;
      return true;
    }
  };

  const mockCrossRoleAuthService: any = {
    isEmailInUse: async (email: string) => {
      if (email === "taken@careerhub.io") {
        return { inUse: true, role: "Student" };
      }
      return { inUse: false };
    }
  };

  // Test Case 1: Get Profile
  try {
    const getProfileUseCase = new GetSuperAdminProfileUseCase(mockSuperAdminRepo);
    const profile = await getProfileUseCase.execute("admin-123");
    assert(profile.firstName === "Arjun", "Profile should fetch correct first name");
    assert(profile.lastName === "Mehta", "Profile should fetch correct last name");
    assert(profile.email === "admin@careerhub.io", "Profile should fetch correct email");
    assert(profile.password === undefined, "Profile payload must not leak password");
  } catch (err) {
    assert(false, `Test Case 1 failed: ${err}`);
  }

  // Test Case 2: Update Profile Details
  try {
    updatedAdminEntity = null;
    const updateProfileUseCase = new UpdateSuperAdminProfileUseCase(mockSuperAdminRepo);
    const updated = await updateProfileUseCase.execute("admin-123", {
      firstName: "Arjun New",
      lastName: "Mehta New"
    });
    assert(updated.firstName === "Arjun New", "Updated payload should reflect new first name");
    assert(updated.lastName === "Mehta New", "Updated payload should reflect new last name");
    assert(updatedAdminEntity !== null && updatedAdminEntity.firstName === "Arjun New", "Repository update should be invoked with correct entity name values");
  } catch (err) {
    assert(false, `Test Case 2 failed: ${err}`);
  }

  // Test Case 3: Change Password with correct credentials
  try {
    updatedAdminEntity = null;
    const changePasswordUseCase = new ChangeSuperAdminPasswordUseCase(mockSuperAdminRepo, mockBcryptService);
    await changePasswordUseCase.execute("admin-123", {
      currentPassword: "current_password_123",
      newPassword: "super_secure_new_password"
    });
    assert(updatedAdminEntity !== null && updatedAdminEntity.password === "hashed_super_secure_new_password", "Password should be hashed and saved in database");
  } catch (err) {
    assert(false, `Test Case 3 failed: ${err}`);
  }

  // Test Case 4: Change Password fails on incorrect current password
  try {
    const changePasswordUseCase = new ChangeSuperAdminPasswordUseCase(mockSuperAdminRepo, mockBcryptService);
    await changePasswordUseCase.execute("admin-123", {
      currentPassword: "wrong_password",
      newPassword: "super_secure_new_password"
    });
    assert(false, "Should have failed due to incorrect password verification");
  } catch (err: any) {
    assert(err.message.includes("Incorrect current password"), "Incorrect current password should throw validation error");
  }

  // Test Case 5: Email Change Request (success case)
  try {
    emailSentTo = "";
    emailOtp = "";
    const requestEmailChangeUseCase = new RequestSuperAdminEmailChangeUseCase(
      mockSuperAdminRepo,
      mockOtpRepository,
      mockEmailService,
      mockCrossRoleAuthService
    );
    await requestEmailChangeUseCase.execute("admin-123", {
      newEmail: "new-email@careerhub.io"
    });
    assert(emailSentTo === "new-email@careerhub.io", "OTP email should be sent to the requested email");
    assert(emailOtp.length === 6, "OTP should be a 6-digit verification code");
    assert(mockOtpRepository.otps["new-email@careerhub.io"] === emailOtp, "Generated OTP must be recorded in OTP store");
  } catch (err) {
    assert(false, `Test Case 5 failed: ${err}`);
  }

  // Test Case 6: Email Change Request fails if email is already taken
  try {
    const requestEmailChangeUseCase = new RequestSuperAdminEmailChangeUseCase(
      mockSuperAdminRepo,
      mockOtpRepository,
      mockEmailService,
      mockCrossRoleAuthService
    );
    await requestEmailChangeUseCase.execute("admin-123", {
      newEmail: "taken@careerhub.io"
    });
    assert(false, "Should have failed because new email is taken");
  } catch (err: any) {
    assert(err.message.includes("Email is already in use"), "Conflict email should throw conflict validation error");
  }

  // Test Case 7: Verify OTP and complete Email change
  try {
    updatedAdminEntity = null;
    const verifyEmailChangeUseCase = new VerifySuperAdminEmailChangeUseCase(
      mockSuperAdminRepo,
      mockOtpRepository,
      mockCrossRoleAuthService
    );
    
    // Inject mock OTP in repository first
    mockOtpRepository.otps["verified@careerhub.io"] = "987654";
    
    await verifyEmailChangeUseCase.execute("admin-123", {
      email: "verified@careerhub.io",
      otp: "987654"
    });
    
    assert(updatedAdminEntity !== null && updatedAdminEntity.email === "verified@careerhub.io", "Email should be updated inside entity props after OTP validation");
    assert(mockOtpRepository.otps["verified@careerhub.io"] === undefined, "Verified OTP should be cleaned up from repository");
  } catch (err) {
    assert(false, `Test Case 7 failed: ${err}`);
  }

  // Test Case 8: Verify OTP fails if code is incorrect
  try {
    const verifyEmailChangeUseCase = new VerifySuperAdminEmailChangeUseCase(
      mockSuperAdminRepo,
      mockOtpRepository,
      mockCrossRoleAuthService
    );
    
    mockOtpRepository.otps["verified@careerhub.io"] = "987654";
    
    await verifyEmailChangeUseCase.execute("admin-123", {
      email: "verified@careerhub.io",
      otp: "000000" // Wrong code
    });
    assert(false, "Should have failed due to incorrect OTP");
  } catch (err: any) {
    assert(err.message.includes("Invalid or expired OTP"), "Invalid OTP must fail verification");
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
