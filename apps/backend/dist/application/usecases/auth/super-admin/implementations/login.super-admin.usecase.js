"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginSuperAdminUseCase = void 0;
const Roles_enum_1 = require("@domain/enums/Roles.enum");
class LoginSuperAdminUseCase {
    constructor(loginUseCase) {
        this.loginUseCase = loginUseCase;
    }
    async execute(dto) {
        return this.loginUseCase.execute(Roles_enum_1.Role.SUPER_ADMIN, dto);
    }
}
exports.LoginSuperAdminUseCase = LoginSuperAdminUseCase;
