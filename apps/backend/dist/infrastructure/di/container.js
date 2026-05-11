"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.container = void 0;
const auth_middleware_1 = require("@presentation/express/middlewares/auth.middleware");
const bcrypt_service_1 = require("@infrastructure/services/hash/bcrypt.service");
const jwt_service_1 = require("@infrastructure/services/token/jwt.service");
const console_email_service_1 = require("@infrastructure/services/email/console-email.service");
const random_service_1 = require("@infrastructure/services/random/random.service");
const account_repository_1 = require("@infrastructure/repositories/account.repository");
const student_repository_1 = require("@infrastructure/repositories/student.repository");
const interviewer_repository_1 = require("@infrastructure/repositories/interviewer.repository");
const organization_repository_1 = require("@infrastructure/repositories/organization.repository");
const company_repository_1 = require("@infrastructure/repositories/company.repository");
const college_admin_model_1 = require("@infrastructure/database/models/college-admin.model");
const hr_user_model_1 = require("@infrastructure/database/models/hr-user.model");
const super_admin_model_1 = require("@infrastructure/database/models/super-admin.model");
const login_usecase_1 = require("@application/usecases/auth/login.usecase");
const refresh_token_usecase_1 = require("@application/usecases/auth/refresh-token.usecase");
const logout_usecase_1 = require("@application/usecases/auth/logout.usecase");
const forgot_password_usecase_1 = require("@application/usecases/auth/forgot-password.usecase");
const reset_password_usecase_1 = require("@application/usecases/auth/reset-password.usecase");
const first_login_set_password_usecase_1 = require("@application/usecases/auth/first-login-set-password.usecase");
const college_signup_usecase_1 = require("@application/usecases/auth/college-signup.usecase");
const company_signup_usecase_1 = require("@application/usecases/auth/company-signup.usecase");
const create_student_usecase_1 = require("@application/usecases/college/create-student.usecase");
const bulk_upload_students_usecase_1 = require("@application/usecases/college/bulk-upload-students.usecase");
const create_interviewer_usecase_1 = require("@application/usecases/hr/create-interviewer.usecase");
const role_enum_1 = require("@domain/enums/role.enum");
const common_auth_controller_1 = require("@presentation/http/controllers/auth/common-auth.controller");
const student_auth_controller_1 = require("@presentation/http/controllers/auth/student-auth.controller");
const college_admin_auth_controller_1 = require("@presentation/http/controllers/auth/college-admin-auth.controller");
const hr_auth_controller_1 = require("@presentation/http/controllers/auth/hr-auth.controller");
const interviewer_auth_controller_1 = require("@presentation/http/controllers/auth/interviewer-auth.controller");
const super_admin_auth_controller_1 = require("@presentation/http/controllers/auth/super-admin-auth.controller");
const onboarding_controller_1 = require("@presentation/http/controllers/public/onboarding.controller");
const student_management_controller_1 = require("@presentation/http/controllers/college-admin/student-management.controller");
const interviewer_management_controller_1 = require("@presentation/http/controllers/hr/interviewer-management.controller");
const hashService = new bcrypt_service_1.BcryptService();
const tokenService = new jwt_service_1.JwtService();
const emailService = new console_email_service_1.ConsoleEmailService();
const randomService = new random_service_1.RandomService();
const studentRepository = new student_repository_1.StudentRepository();
const collegeAdminRepository = new account_repository_1.MongooseAccountRepository(role_enum_1.Role.COLLEGE_ADMIN, college_admin_model_1.CollegeAdminModel);
const hrRepository = new account_repository_1.MongooseAccountRepository(role_enum_1.Role.HR, hr_user_model_1.HrUserModel);
const interviewerRepository = new interviewer_repository_1.InterviewerRepository();
const superAdminRepository = new account_repository_1.MongooseAccountRepository(role_enum_1.Role.SUPER_ADMIN, super_admin_model_1.SuperAdminModel);
const organizationRepository = new organization_repository_1.OrganizationRepository();
const companyRepository = new company_repository_1.CompanyRepository();
const accountRepositories = [
    studentRepository,
    collegeAdminRepository,
    hrRepository,
    interviewerRepository,
    superAdminRepository,
];
const loginUseCases = new Map([
    [role_enum_1.Role.STUDENT, new login_usecase_1.LoginUseCase(studentRepository, hashService, tokenService)],
    [role_enum_1.Role.COLLEGE_ADMIN, new login_usecase_1.LoginUseCase(collegeAdminRepository, hashService, tokenService)],
    [role_enum_1.Role.HR, new login_usecase_1.LoginUseCase(hrRepository, hashService, tokenService)],
    [role_enum_1.Role.INTERVIEWER, new login_usecase_1.LoginUseCase(interviewerRepository, hashService, tokenService)],
    [role_enum_1.Role.SUPER_ADMIN, new login_usecase_1.LoginUseCase(superAdminRepository, hashService, tokenService)],
]);
exports.container = {
    authMiddleware: new auth_middleware_1.AuthMiddleware(tokenService),
    commonAuthController: new common_auth_controller_1.CommonAuthController(new refresh_token_usecase_1.RefreshTokenUseCase(accountRepositories, hashService, tokenService), new logout_usecase_1.LogoutUseCase(accountRepositories), new forgot_password_usecase_1.ForgotPasswordUseCase(accountRepositories, randomService, hashService, emailService), new reset_password_usecase_1.ResetPasswordUseCase(accountRepositories, hashService)),
    studentAuthController: new student_auth_controller_1.StudentAuthController(loginUseCases.get(role_enum_1.Role.STUDENT), new first_login_set_password_usecase_1.FirstLoginSetPasswordUseCase(studentRepository, hashService, role_enum_1.Role.STUDENT)),
    collegeAdminAuthController: new college_admin_auth_controller_1.CollegeAdminAuthController(loginUseCases.get(role_enum_1.Role.COLLEGE_ADMIN)),
    hrAuthController: new hr_auth_controller_1.HrAuthController(loginUseCases.get(role_enum_1.Role.HR)),
    interviewerAuthController: new interviewer_auth_controller_1.InterviewerAuthController(loginUseCases.get(role_enum_1.Role.INTERVIEWER), new first_login_set_password_usecase_1.FirstLoginSetPasswordUseCase(interviewerRepository, hashService, role_enum_1.Role.INTERVIEWER)),
    superAdminAuthController: new super_admin_auth_controller_1.SuperAdminAuthController(loginUseCases.get(role_enum_1.Role.SUPER_ADMIN)),
    onboardingController: new onboarding_controller_1.OnboardingController(new college_signup_usecase_1.CollegeSignupUseCase(collegeAdminRepository, organizationRepository, hashService, emailService), new company_signup_usecase_1.CompanySignupUseCase(hrRepository, companyRepository, hashService, emailService)),
    studentManagementController: new student_management_controller_1.StudentManagementController(new create_student_usecase_1.CreateStudentUseCase(studentRepository, hashService, randomService, emailService), new bulk_upload_students_usecase_1.BulkUploadStudentsUseCase(new create_student_usecase_1.CreateStudentUseCase(studentRepository, hashService, randomService, emailService))),
    interviewerManagementController: new interviewer_management_controller_1.InterviewerManagementController(new create_interviewer_usecase_1.CreateInterviewerUseCase(interviewerRepository, hashService, randomService, emailService)),
};
