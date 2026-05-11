import { GetDashboardStatsUseCase } from "@application/usecases/super-admin/GetDashboardStats.usecase";
import { GetOrganizationsUseCase } from "@application/usecases/super-admin/GetOrganizations.usecase";
import { GetStudentsUseCase } from "@application/usecases/super-admin/GetStudents.usecase";
import { GetCompaniesUseCase } from "@application/usecases/super-admin/GetCompanies.usecase";
import { GetInterviewersUseCase } from "@application/usecases/super-admin/GetInterviewers.usecase";
import { 
    studentRepository, 
    companyRepository, 
    interviewerRepository, 
    superAdminRepository 
} from "@infrastructure/di/infra.container";
import { OrganizationRepository } from "@infrastructure/repositories/organization.repository";
import { SuperAdminController } from "@presentation/http/controllers/super-admin/super-admin.controller";

// We need an instance of organizationRepository which might not be in the main container or it is
import { studentRepository as studentRepo } from "@infrastructure/di/infra.container";

// Let's assume organizationRepository is also in the container, if not I'll create it
const orgRepository = new OrganizationRepository();

export const makeGetDashboardStatsUseCase = () => {
  return new GetDashboardStatsUseCase(orgRepository, studentRepository, companyRepository, interviewerRepository);
};

export const makeGetOrganizationsUseCase = () => {
  return new GetOrganizationsUseCase(orgRepository);
};

export const makeGetStudentsUseCase = () => {
  return new GetStudentsUseCase(studentRepository);
};

export const makeGetCompaniesUseCase = () => {
  return new GetCompaniesUseCase(companyRepository);
};

export const makeGetInterviewersUseCase = () => {
  return new GetInterviewersUseCase(interviewerRepository);
};

export const makeSuperAdminController = () => {
  return new SuperAdminController(
    makeGetDashboardStatsUseCase(),
    makeGetOrganizationsUseCase(),
    makeGetStudentsUseCase(),
    makeGetCompaniesUseCase(),
    makeGetInterviewersUseCase()
  );
};
