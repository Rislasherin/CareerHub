"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginCollegeAdminUseCase = void 0;
const AuthError_1 = require("@application/errors/AuthError");
const user_status_enum_1 = require("@domain/enums/user.status.enum");
const Roles_enum_1 = require("@domain/enums/Roles.enum");
class LoginCollegeAdminUseCase {
    constructor(_collegeAdminRepository, _organizationRepository, _jwtService, _bcryptService) {
        this._collegeAdminRepository = _collegeAdminRepository;
        this._organizationRepository = _organizationRepository;
        this._jwtService = _jwtService;
        this._bcryptService = _bcryptService;
    }
    async execute(dto) {
        const admin = await this._collegeAdminRepository.findByEmail(dto.email);
        if (!admin) {
            throw new AuthError_1.InvalidCredentialsError();
        }
        if (admin.status === user_status_enum_1.UserStatus.BLOCKED || admin.status === user_status_enum_1.UserStatus.REJECTED) {
            throw new AuthError_1.UnauthorizedError("Your account has been blocked or rejected.");
        }
        if (admin.status !== user_status_enum_1.UserStatus.ACTIVE && admin.status !== user_status_enum_1.UserStatus.PENDING) {
            throw new AuthError_1.UnauthorizedError("Your account is not active. Please verify your email.");
        }
        const isPasswordValid = await this._bcryptService.compare(dto.password, admin.password);
        if (!isPasswordValid) {
            throw new AuthError_1.InvalidCredentialsError();
        }
        const organization = await this._organizationRepository.findById(admin.orgId);
        if (organization?.status === user_status_enum_1.UserStatus.BLOCKED) {
            throw new AuthError_1.UnauthorizedError("Your institution has been blocked. Please contact admin.");
        }
        const payload = {
            id: admin.id,
            role: Roles_enum_1.Role.COLLEGE_ADMIN,
            orgId: admin.orgId,
        };
        return {
            accessToken: this._jwtService.signAccessToken(payload),
            refreshToken: this._jwtService.signRefreshToken(payload),
            admin: {
                id: admin.id,
                firstName: admin.firstName,
                lastName: admin.lastName,
                email: admin.email,
                role: admin.role,
                organizationId: admin.orgId,
            },
            organization: organization?.toJSON(),
        };
    }
}
exports.LoginCollegeAdminUseCase = LoginCollegeAdminUseCase;
