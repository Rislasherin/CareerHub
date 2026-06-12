"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginHRUseCase = void 0;
const AuthError_1 = require("@application/errors/AuthError");
const user_status_enum_1 = require("@domain/enums/user.status.enum");
const Roles_enum_1 = require("@domain/enums/Roles.enum");
class LoginHRUseCase {
    constructor(_hrUserRepository, _comptypeRepository, _jwtService, _bcryptService) {
        this._hrUserRepository = _hrUserRepository;
        this._comptypeRepository = _comptypeRepository;
        this._jwtService = _jwtService;
        this._bcryptService = _bcryptService;
    }
    async execute(dto) {
        const hrUser = await this._hrUserRepository.findByEmail(dto.email);
        if (!hrUser) {
            throw new AuthError_1.InvalidCredentialsError();
        }
        if (hrUser.status === user_status_enum_1.UserStatus.BLOCKED || hrUser.status === user_status_enum_1.UserStatus.REJECTED) {
            throw new AuthError_1.UnauthorizedError("Your account has been blocked or rejected.");
        }
        if (hrUser.status !== user_status_enum_1.UserStatus.ACTIVE && hrUser.status !== user_status_enum_1.UserStatus.PENDING) {
            throw new AuthError_1.UnauthorizedError("Your account is not active");
        }
        const isPasswordValid = await this._bcryptService.compare(dto.password, hrUser.password);
        if (!isPasswordValid) {
            throw new AuthError_1.InvalidCredentialsError();
        }
        const comptype = await this._comptypeRepository.findById(hrUser.comptypeId);
        if (comptype?.status === user_status_enum_1.UserStatus.BLOCKED) {
            throw new AuthError_1.UnauthorizedError("Your comptype has been blocked. Please contact admin.");
        }
        const payload = {
            id: hrUser.id,
            role: Roles_enum_1.Role.HR,
            comptypeId: hrUser.comptypeId,
        };
        return {
            accessToken: this._jwtService.signAccessToken(payload),
            refreshToken: this._jwtService.signRefreshToken(payload),
            hrUser: {
                id: hrUser.id,
                firstName: hrUser.firstName,
                lastName: hrUser.lastName,
                email: hrUser.email,
                role: hrUser.role,
                comptypeId: hrUser.comptypeId,
            },
            comptype: comptype?.toJSON(),
        };
    }
}
exports.LoginHRUseCase = LoginHRUseCase;
