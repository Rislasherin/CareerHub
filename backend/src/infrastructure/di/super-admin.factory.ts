import { GetDashboardStatsUseCase } from "@application/usecases/super-admin/implementations/GetDashboardStats.usecase";
import { GetOrganizationsUseCase } from "@application/usecases/super-admin/implementations/GetOrganizations.usecase";
import { GetStudentsUseCase } from "@application/usecases/super-admin/implementations/GetStudents.usecase";
import { GetCompaniesUseCase } from "@application/usecases/super-admin/implementations/GetCompanies.usecase";
import { GetInterviewersUseCase } from "@application/usecases/super-admin/implementations/GetInterviewers.usecase";
import {
  studentRepository,
  companyRepository,
  interviewerRepository,
  superAdminRepository,
  collegeAdminRepository,
  hrUserRepository
} from "@infrastructure/di/infra.container";
import { OrganizationRepository } from "@infrastructure/repositories/organization.repository";
import { SuperAdminController } from "@presentation/http/controllers/super-admin/super-admin.controller";
import { studentRepository as studentRepo } from "@infrastructure/di/infra.container";
import { PlatformSettingsController } from "@presentation/http/controllers/super-admin/platformSettings.controller";
import { PlatformSettingsRepository } from "@infrastructure/repositories/PlatformSettingsRepository";


const orgRepository = new OrganizationRepository();
const platformSettingsRepository = new PlatformSettingsRepository();

export const makeGetDashboardStatsUseCase = () => {
  return new GetDashboardStatsUseCase(orgRepository, studentRepository, companyRepository, interviewerRepository, hrUserRepository);
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

export const makeGetInterviewersUseCase = () => {
  return new GetInterviewersUseCase(interviewerRepository);
};

import { LoginSuperAdminUseCase } from "@application/usecases/auth/superadmin/implementations/LoginSuperAdmin.usecase";
import { SuperAdminAuthController } from "@presentation/http/controllers/auth/superadmin/superadmin.auth.controller";
import { bcryptService, jwtService } from "@infrastructure/di/infra.container";

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
  return new UpdateUserStatusUseCase(studentRepository, orgRepository, companyRepository, interviewerRepository, hrUserRepository, collegeAdminRepository, new EmailService());
};

export const makeDeleteUserUseCase = () => {
  return new DeleteUserUseCase(studentRepository, orgRepository, companyRepository, interviewerRepository, hrUserRepository);
};

export const makeUpdateOrganizationPlanUseCase = () => {
  return new UpdateOrganizationPlanUseCase(orgRepository);
};


export const makeGetPlatformSettingsUseCase = () => {
    return new GetPlatformSettingsUseCase(platformSettingsRepository);
};
export const makeUpdatePlatformSettingsUseCase = () => {
    return new UpdatePlatformSettingsUseCase(platformSettingsRepository);
};
export const makeSuperAdminController = () => {
  return new SuperAdminController(
    makeGetDashboardStatsUseCase(),
    makeGetOrganizationsUseCase(),
    makeGetStudentsUseCase(),
    makeGetCompaniesUseCase(),
    makeGetInterviewersUseCase(),
    makeUpdateUserStatusUseCase(),
    makeDeleteUserUseCase(),
    makeUpdateOrganizationPlanUseCase()
  );
};


export const makePlatformSettingsController = () => {
    return new PlatformSettingsController(
        makeGetPlatformSettingsUseCase(),
        makeUpdatePlatformSettingsUseCase()
    );
};
