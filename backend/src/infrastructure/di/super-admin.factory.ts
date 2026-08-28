import { GetDashboardStatsUseCase } from "@application/usecases/super-admin/implementations/GetDashboardStats.usecase";
import { GetOrganizationsUseCase } from "@application/usecases/super-admin/implementations/GetOrganizations.usecase";
import { GetStudentsUseCase } from "@application/usecases/super-admin/implementations/GetStudents.usecase";
import { GetCompaniesUseCase } from "@application/usecases/super-admin/implementations/GetCompanies.usecase";

import { GetBillingInvoicesUseCase } from "@application/usecases/super-admin/implementations/GetBillingInvoices.usecase";
import { SendRenewalReminderUseCase } from "@application/usecases/super-admin/implementations/SendRenewalReminder.usecase";
import { GetSuperAdminRevenueUseCase } from "@application/usecases/super-admin/implementations/GetSuperAdminRevenueUseCase";
import { GetSuperAdminProfileUseCase } from "@application/usecases/super-admin/implementations/GetSuperAdminProfileUseCase";
import { UpdateSuperAdminProfileUseCase } from "@application/usecases/super-admin/implementations/UpdateSuperAdminProfileUseCase";
import { ChangeSuperAdminPasswordUseCase } from "@application/usecases/super-admin/implementations/ChangeSuperAdminPasswordUseCase";
import { RequestSuperAdminEmailChangeUseCase } from "@application/usecases/super-admin/implementations/RequestSuperAdminEmailChangeUseCase";
import { VerifySuperAdminEmailChangeUseCase } from "@application/usecases/super-admin/implementations/VerifySuperAdminEmailChangeUseCase";
import {
  studentRepository,
  companyRepository,
  superAdminRepository,
  collegeAdminRepository,
  hrUserRepository,
  otpRepository,
  crossRoleAuthService,
  bcryptService
} from "@infrastructure/di/infra.container";
import { OrganizationRepository } from "@infrastructure/repositories/organization.repository";
import { SuperAdminController } from "@presentation/http/controllers/super-admin/super-admin.controller";
import { studentRepository as studentRepo, subscriptionRepository } from "@infrastructure/di/infra.container";
import { PlatformSettingsController } from "@presentation/http/controllers/super-admin/platformSettings.controller";
import { PlatformSettingsRepository } from "@infrastructure/repositories/PlatformSettingsRepository";

const orgRepository = new OrganizationRepository();
const platformSettingsRepository = new PlatformSettingsRepository();

export const makeGetDashboardStatsUseCase = () => {
  return new GetDashboardStatsUseCase(orgRepository, studentRepository, companyRepository, subscriptionRepository);
};

export const makeGetOrganizationsUseCase = () => {
  return new GetOrganizationsUseCase(orgRepository, studentRepository, collegeAdminRepository);
};

export const makeGetStudentsUseCase = () => {
  return new GetStudentsUseCase(studentRepository, orgRepository);
};

export const makeGetCompaniesUseCase = () => {
  return new GetCompaniesUseCase(companyRepository, hrUserRepository);
};



export const makeGetBillingInvoicesUseCase = () => {
  return new GetBillingInvoicesUseCase(subscriptionRepository, orgRepository);
};

export const makeSendRenewalReminderUseCase = () => {
  return new SendRenewalReminderUseCase(subscriptionRepository, orgRepository, new EmailService(), collegeAdminRepository);
};

export const makeGetSuperAdminRevenueUseCase = () => {
  return new GetSuperAdminRevenueUseCase(subscriptionRepository, orgRepository);
};

import { LoginSuperAdminUseCase } from "@application/usecases/auth/superadmin/implementations/LoginSuperAdmin.usecase";
import { SuperAdminAuthController } from "@presentation/http/controllers/auth/superadmin/superadmin.auth.controller";
import { jwtService } from "@infrastructure/di/infra.container";

export const makeLoginSuperAdminUseCase = () => {
  return new LoginSuperAdminUseCase(superAdminRepository, jwtService, bcryptService);
};

export const makeSuperAdminAuthController = () => {
  return new SuperAdminAuthController(makeLoginSuperAdminUseCase());
};

import { UpdateUserStatusUseCase } from "@application/usecases/super-admin/implementations/UpdateUserStatus.usecase";
import { DeleteUserUseCase } from "@application/usecases/super-admin/implementations/DeleteUser.usecase";
import { UpdateOrganizationPlanUseCase } from "@application/usecases/super-admin/implementations/UpdateOrganizationPlan.usecase";
import { GetPlatformSettingsUseCase } from "@application/usecases/super-admin/implementations/GetPlatformSettings.usecase";
import { UpdatePlatformSettingsDTO } from "@application/dtos/super-admin/Request/platformSettings.request.dto";
import { UpdatePlatformSettingsUseCase } from "@application/usecases/super-admin/implementations/UpdatePlatformSettings.usecase";

import { EmailService } from "@infrastructure/services/email/email.service";

export const makeUpdateUserStatusUseCase = () => {
  return new UpdateUserStatusUseCase(studentRepository, orgRepository, companyRepository, hrUserRepository, collegeAdminRepository, new EmailService());
};

export const makeDeleteUserUseCase = () => {
  return new DeleteUserUseCase(studentRepository, orgRepository, companyRepository, hrUserRepository);
};

export const makeUpdateOrganizationPlanUseCase = () => {
  return new UpdateOrganizationPlanUseCase(orgRepository);
};

import { ExtendCollegeTrialUseCase } from "@application/usecases/super-admin/implementations/ExtendCollegeTrial.usecase";

export const makeExtendCollegeTrialUseCase = () => {
  return new ExtendCollegeTrialUseCase(orgRepository);
};

export const makeGetPlatformSettingsUseCase = () => {
    return new GetPlatformSettingsUseCase(platformSettingsRepository);
};
export const makeUpdatePlatformSettingsUseCase = () => {
    return new UpdatePlatformSettingsUseCase(platformSettingsRepository);
};
export const makeGetSuperAdminProfileUseCase = () => {
  return new GetSuperAdminProfileUseCase(superAdminRepository);
};

export const makeUpdateSuperAdminProfileUseCase = () => {
  return new UpdateSuperAdminProfileUseCase(superAdminRepository);
};

export const makeChangeSuperAdminPasswordUseCase = () => {
  return new ChangeSuperAdminPasswordUseCase(superAdminRepository, bcryptService);
};

export const makeRequestSuperAdminEmailChangeUseCase = () => {
  return new RequestSuperAdminEmailChangeUseCase(superAdminRepository, otpRepository, new EmailService(), crossRoleAuthService);
};

export const makeVerifySuperAdminEmailChangeUseCase = () => {
  return new VerifySuperAdminEmailChangeUseCase(superAdminRepository, otpRepository, crossRoleAuthService);
};

export const makeSuperAdminController = () => {
  return new SuperAdminController(
    makeGetDashboardStatsUseCase(),
    makeGetOrganizationsUseCase(),
    makeGetStudentsUseCase(),
    makeGetCompaniesUseCase(),
    makeUpdateUserStatusUseCase(),
    makeDeleteUserUseCase(),
    makeUpdateOrganizationPlanUseCase(),
    makeExtendCollegeTrialUseCase(),
    makeGetBillingInvoicesUseCase(),
    makeSendRenewalReminderUseCase(),
    makeGetSuperAdminRevenueUseCase(),
    makeGetSuperAdminProfileUseCase(),
    makeUpdateSuperAdminProfileUseCase(),
    makeChangeSuperAdminPasswordUseCase(),
    makeRequestSuperAdminEmailChangeUseCase(),
    makeVerifySuperAdminEmailChangeUseCase()
  );
};

export const makePlatformSettingsController = () => {
    return new PlatformSettingsController(
        makeGetPlatformSettingsUseCase(),
        makeUpdatePlatformSettingsUseCase()
    );
};
