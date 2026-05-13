"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginSuperAdminUseCase = void 0;
const AuthError_1 = require("@application/errors/AuthError");
const Roles_enum_1 = require("@domain/enums/Roles.enum");
class LoginSuperAdminUseCase {
    constructor(_superAdminRepository, _jwtService, _bcryptService) {
        this._superAdminRepository = _superAdminRepository;
        this._jwtService = _jwtService;
        this._bcryptService = _bcryptService;
    }
    async execute(dto) {
        const admin = await this._superAdminRepository.findByEmail(dto.email);
        if (!admin) {
            throw new AuthError_1.InvalidCredentialsError();
        }
        const isPasswordValid = await this._bcryptService.compare(dto.password, admin.password);
        if (!isPasswordValid) {
            throw new AuthError_1.InvalidCredentialsError();
        }
        const payload = {
            id: admin.id,
            role: Roles_enum_1.Role.SUPER_ADMIN,
        };
        return {
            accessToken: this._jwtService.signAccessToken(payload),
            refreshToken: this._jwtService.signRefreshToken(payload),
            admin: {
                id: admin.id,
                email: admin.email,
                role: admin.role,
            },
        };
    }
}
exports.LoginSuperAdminUseCase = LoginSuperAdminUseCase;
