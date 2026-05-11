"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginHrUseCase = void 0;
const Roles_enum_1 = require("@domain/enums/Roles.enum");
class LoginHrUseCase {
    constructor(loginUseCase) {
        this.loginUseCase = loginUseCase;
    }
    async execute(dto) {
        return this.loginUseCase.execute(Roles_enum_1.Role.HR, dto);
    }
}
exports.LoginHrUseCase = LoginHrUseCase;
