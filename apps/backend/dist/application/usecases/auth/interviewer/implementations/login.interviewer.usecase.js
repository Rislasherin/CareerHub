"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginInterviewerUseCase = void 0;
const Roles_enum_1 = require("@domain/enums/Roles.enum");
class LoginInterviewerUseCase {
    constructor(loginUseCase) {
        this.loginUseCase = loginUseCase;
    }
    async execute(dto) {
        return this.loginUseCase.execute(Roles_enum_1.Role.INTERVIEWER, dto);
    }
}
exports.LoginInterviewerUseCase = LoginInterviewerUseCase;
