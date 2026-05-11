"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginStudentUseCase = void 0;
const AuthError_1 = require("@application/errors/AuthError");
const user_status_enum_1 = require("@domain/enums/user.status.enum");
const Roles_enum_1 = require("@domain/enums/Roles.enum");
class LoginStudentUseCase {
    constructor(studentRepository, jwtService, bcryptService) {
        this.studentRepository = studentRepository;
        this.jwtService = jwtService;
        this.bcryptService = bcryptService;
    }
    async execute(dto) {
        const student = await this.studentRepository.findByEmail(dto.email);
        if (!student) {
            throw new AuthError_1.InvalidCredentialsError();
        }
        if (student.status !== user_status_enum_1.UserStatus.ACTIVE) {
            throw new AuthError_1.UnauthorizedError();
        }
        const isPasswordValid = await this.bcryptService.compare(dto.password, student.password);
        if (!isPasswordValid) {
            throw new AuthError_1.InvalidCredentialsError();
        }
        const payload = {
            id: student.id ?? "",
            role: Roles_enum_1.Role.STUDENT,
            orgId: student.toJSON().collegeId,
        };
        return {
            accessToken: this.jwtService.signAccessToken(payload),
            refreshToken: this.jwtService.signRefreshToken(payload),
            student: {
                id: student.id,
                name: student.toJSON().name,
                email: student.email,
                status: student.status,
                isFirstLogin: student.isFirstLogin,
            },
        };
    }
}
exports.LoginStudentUseCase = LoginStudentUseCase;
