import { GetDashboardStatsUseCase } from "@application/usecases/super-admin/GetDashboardStats.usecase";
import { GetOrganizationsUseCase } from "@application/usecases/super-admin/GetOrganizations.usecase";
import { GetStudentsUseCase } from "@application/usecases/super-admin/GetStudents.usecase";
import { GetCompaniesUseCase } from "@application/usecases/super-admin/GetCompanies.usecase";
import { GetInterviewersUseCase } from "@application/usecases/super-admin/GetInterviewers.usecase";
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

// We need an instance of organizationRepository which might not be in the main container or it is
import { studentRepository as studentRepo } from "@infrastructure/di/infra.container";

// Let's assume organizationRepository is also in the container, if not I'll create it
const orgRepository = new OrganizationRepository();

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

import { UpdateUserStatusUseCase } from "@application/usecases/super-admin/UpdateUserStatus.usecase";
import { DeleteUserUseCase } from "@application/usecases/super-admin/DeleteUser.usecase";

export const makeUpdateUserStatusUseCase = () => {
  return new UpdateUserStatusUseCase(studentRepository, orgRepository, companyRepository, interviewerRepository, hrUserRepository);
};

export const makeDeleteUserUseCase = () => {
  return new DeleteUserUseCase(studentRepository, orgRepository, companyRepository, interviewerRepository, hrUserRepository);
};

export const makeSuperAdminController = () => {
  return new SuperAdminController(
    makeGetDashboardStatsUseCase(),
    makeGetOrganizationsUseCase(),
    makeGetStudentsUseCase(),
    makeGetCompaniesUseCase(),
    makeGetInterviewersUseCase(),
    makeUpdateUserStatusUseCase(),
    makeDeleteUserUseCase()
  );
};
