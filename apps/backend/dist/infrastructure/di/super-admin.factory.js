"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeSuperAdminController = exports.makeDeleteUserUseCase = exports.makeUpdateUserStatusUseCase = exports.makeSuperAdminAuthController = exports.makeLoginSuperAdminUseCase = exports.makeGetInterviewersUseCase = exports.makeGetCompaniesUseCase = exports.makeGetStudentsUseCase = exports.makeGetOrganizationsUseCase = exports.makeGetDashboardStatsUseCase = void 0;
const GetDashboardStats_usecase_1 = require("@application/usecases/super-admin/GetDashboardStats.usecase");
const GetOrganizations_usecase_1 = require("@application/usecases/super-admin/GetOrganizations.usecase");
const GetStudents_usecase_1 = require("@application/usecases/super-admin/GetStudents.usecase");
const GetCompanies_usecase_1 = require("@application/usecases/super-admin/GetCompanies.usecase");
const GetInterviewers_usecase_1 = require("@application/usecases/super-admin/GetInterviewers.usecase");
const infra_container_1 = require("@infrastructure/di/infra.container");
const organization_repository_1 = require("@infrastructure/repositories/organization.repository");
const super_admin_controller_1 = require("@presentation/http/controllers/super-admin/super-admin.controller");
// Let's assume organizationRepository is also in the container, if not I'll create it
const orgRepository = new organization_repository_1.OrganizationRepository();
const makeGetDashboardStatsUseCase = () => {
    return new GetDashboardStats_usecase_1.GetDashboardStatsUseCase(orgRepository, infra_container_1.studentRepository, infra_container_1.companyRepository, infra_container_1.interviewerRepository);
};
exports.makeGetDashboardStatsUseCase = makeGetDashboardStatsUseCase;
const makeGetOrganizationsUseCase = () => {
    return new GetOrganizations_usecase_1.GetOrganizationsUseCase(orgRepository);
};
exports.makeGetOrganizationsUseCase = makeGetOrganizationsUseCase;
const makeGetStudentsUseCase = () => {
    return new GetStudents_usecase_1.GetStudentsUseCase(infra_container_1.studentRepository);
};
exports.makeGetStudentsUseCase = makeGetStudentsUseCase;
const makeGetCompaniesUseCase = () => {
    return new GetCompanies_usecase_1.GetCompaniesUseCase(infra_container_1.companyRepository);
};
exports.makeGetCompaniesUseCase = makeGetCompaniesUseCase;
const makeGetInterviewersUseCase = () => {
    return new GetInterviewers_usecase_1.GetInterviewersUseCase(infra_container_1.interviewerRepository);
};
exports.makeGetInterviewersUseCase = makeGetInterviewersUseCase;
const LoginSuperAdmin_usecase_1 = require("@application/usecases/auth/superadmin/implementations/LoginSuperAdmin.usecase");
const superadmin_auth_controller_1 = require("@presentation/http/controllers/auth/superadmin/superadmin.auth.controller");
const infra_container_2 = require("@infrastructure/di/infra.container");
const makeLoginSuperAdminUseCase = () => {
    return new LoginSuperAdmin_usecase_1.LoginSuperAdminUseCase(infra_container_1.superAdminRepository, infra_container_2.jwtService, infra_container_2.bcryptService);
};
exports.makeLoginSuperAdminUseCase = makeLoginSuperAdminUseCase;
const makeSuperAdminAuthController = () => {
    return new superadmin_auth_controller_1.SuperAdminAuthController((0, exports.makeLoginSuperAdminUseCase)());
};
exports.makeSuperAdminAuthController = makeSuperAdminAuthController;
const UpdateUserStatus_usecase_1 = require("@application/usecases/super-admin/UpdateUserStatus.usecase");
const DeleteUser_usecase_1 = require("@application/usecases/super-admin/DeleteUser.usecase");
const makeUpdateUserStatusUseCase = () => {
    return new UpdateUserStatus_usecase_1.UpdateUserStatusUseCase(infra_container_1.studentRepository, orgRepository, infra_container_1.companyRepository, infra_container_1.interviewerRepository);
};
exports.makeUpdateUserStatusUseCase = makeUpdateUserStatusUseCase;
const makeDeleteUserUseCase = () => {
    return new DeleteUser_usecase_1.DeleteUserUseCase(infra_container_1.studentRepository, orgRepository, infra_container_1.companyRepository, infra_container_1.interviewerRepository);
};
exports.makeDeleteUserUseCase = makeDeleteUserUseCase;
const makeSuperAdminController = () => {
    return new super_admin_controller_1.SuperAdminController((0, exports.makeGetDashboardStatsUseCase)(), (0, exports.makeGetOrganizationsUseCase)(), (0, exports.makeGetStudentsUseCase)(), (0, exports.makeGetCompaniesUseCase)(), (0, exports.makeGetInterviewersUseCase)(), (0, exports.makeUpdateUserStatusUseCase)(), (0, exports.makeDeleteUserUseCase)());
};
exports.makeSuperAdminController = makeSuperAdminController;
