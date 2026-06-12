"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginStudentUseCase = void 0;
const AuthError_1 = require("@application/errors/AuthError");
const user_status_enum_1 = require("@domain/enums/user.status.enum");
const Roles_enum_1 = require("@domain/enums/Roles.enum");
class LoginStudentUseCase {
    constructor(_studentRepository, _jwtService, _bcryptService, _crossRoleAuthService) {
        this._studentRepository = _studentRepository;
        this._jwtService = _jwtService;
        this._bcryptService = _bcryptService;
        this._crossRoleAuthService = _crossRoleAuthService;
    }
    async execute(dto) {
        const student = await this._studentRepository.findByEmail(dto.email);
        if (!student) {
            const globalCheck = await this._crossRoleAuthService.isEmailInUse(dto.email);
            if (globalCheck.inUse) {
                throw new AuthError_1.UnauthorizedError(`This email is registered as a ${globalCheck.role}. Please use the correct login portal.`);
            }
            throw new AuthError_1.InvalidCredentialsError();
        }
        const allowedStatuses = [user_status_enum_1.UserStatus.ACTIVE, user_status_enum_1.UserStatus.PENDING_VERIFICATION, user_status_enum_1.UserStatus.REJECTED];
        if (!allowedStatuses.includes(student.status)) {
            if (student.status === user_status_enum_1.UserStatus.BLOCKED) {
                throw new AuthError_1.UnauthorizedError("Your account has been blocked by admin.");
            }
            throw new AuthError_1.UnauthorizedError(`Account is ${student.status.toLowerCase().replace('_', ' ')}. Please contact support.`);
        }
        const isPasswordValid = await this._bcryptService.compare(dto.password, student.password);
        if (!isPasswordValid) {
            throw new AuthError_1.InvalidCredentialsError();
        }
        const payload = {
            id: student.id ?? "",
            role: Roles_enum_1.Role.STUDENT,
            orgId: student.toJSON().collegeId,
        };
        return {
            accessToken: this._jwtService.signAccessToken(payload),
            refreshToken: this._jwtService.signRefreshToken(payload),
            student: {
                id: student.id,
                firstName: student.firstName,
                lastName: student.lastName,
                email: student.email,
                status: student.status,
                isFirstLogin: student.isFirstLogin,
            },
        };
    }
}
exports.LoginStudentUseCase = LoginStudentUseCase;
