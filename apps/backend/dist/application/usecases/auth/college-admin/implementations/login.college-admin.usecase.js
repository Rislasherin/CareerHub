"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginCollegeAdminUseCase = void 0;
const Roles_enum_1 = require("@domain/enums/Roles.enum");
class LoginCollegeAdminUseCase {
    constructor(loginUseCase) {
        this.loginUseCase = loginUseCase;
    }
    async execute(dto) {
        return this.loginUseCase.execute(Roles_enum_1.Role.COLLEGE_ADMIN, dto);
    }
}
exports.LoginCollegeAdminUseCase = LoginCollegeAdminUseCase;
