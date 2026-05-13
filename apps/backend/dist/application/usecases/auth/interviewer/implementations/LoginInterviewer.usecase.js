"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginInterviewerUseCase = void 0;
const AuthError_1 = require("@application/errors/AuthError");
const user_status_enum_1 = require("@domain/enums/user.status.enum");
const Roles_enum_1 = require("@domain/enums/Roles.enum");
class LoginInterviewerUseCase {
    constructor(_interviewerRepository, _jwtService, _bcryptService) {
        this._interviewerRepository = _interviewerRepository;
        this._jwtService = _jwtService;
        this._bcryptService = _bcryptService;
    }
    async execute(dto) {
        const interviewer = await this._interviewerRepository.findByEmail(dto.email);
        if (!interviewer) {
            throw new AuthError_1.InvalidCredentialsError();
        }
        if (interviewer.status !== user_status_enum_1.UserStatus.ACTIVE) {
            throw new AuthError_1.UnauthorizedError("Your account is not active.");
        }
        const isPasswordValid = await this._bcryptService.compare(dto.password, interviewer.password);
        if (!isPasswordValid) {
            throw new AuthError_1.InvalidCredentialsError();
        }
        const payload = {
            id: interviewer.id,
            role: Roles_enum_1.Role.INTERVIEWER,
            companyId: interviewer.companyId,
        };
        return {
            accessToken: this._jwtService.signAccessToken(payload),
            refreshToken: this._jwtService.signRefreshToken(payload),
            interviewer: {
                id: interviewer.id,
                firstName: interviewer.firstName,
                lastName: interviewer.lastName,
                email: interviewer.email,
                role: interviewer.role,
                companyId: interviewer.companyId,
            },
        };
    }
}
exports.LoginInterviewerUseCase = LoginInterviewerUseCase;
