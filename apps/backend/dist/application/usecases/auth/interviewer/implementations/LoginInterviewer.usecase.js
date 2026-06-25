"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginInterviewerUseCase = void 0;
const AuthError_1 = require("@application/errors/AuthError");
const user_status_enum_1 = require("@domain/enums/user.status.enum");
const Roles_enum_1 = require("@domain/enums/Roles.enum");
class LoginInterviewerUseCase {
    constructor(_interviewerRepository, _companyRepository, _jwtService, _bcryptService, _crossRoleAuthService) {
        this._interviewerRepository = _interviewerRepository;
        this._companyRepository = _companyRepository;
        this._jwtService = _jwtService;
        this._bcryptService = _bcryptService;
        this._crossRoleAuthService = _crossRoleAuthService;
    }
    async execute(dto) {
        console.log(`[LOGIN] Attempting login for interviewer: ${dto.email}`);
        const interviewer = await this._interviewerRepository.findByEmail(dto.email);
        console.log(`[LOGIN] Interviewer lookup result: ${interviewer ? 'Found' : 'Not Found'}`);
        if (!interviewer) {
            const globalCheck = await this._crossRoleAuthService.isEmailInUse(dto.email);
            if (globalCheck.inUse) {
                throw new AuthError_1.UnauthorizedError(`This email is registered as a ${globalCheck.role}. Please use the correct login portal.`);
            }
            throw new AuthError_1.InvalidCredentialsError();
        }
        if (interviewer.status === user_status_enum_1.UserStatus.BLOCKED) {
            throw new AuthError_1.UnauthorizedError("Your account has been blocked by admin.");
        }
        if (interviewer.status !== user_status_enum_1.UserStatus.ACTIVE) {
            throw new AuthError_1.UnauthorizedError("Your account is not active.");
        }
        const isPasswordValid = await this._bcryptService.compare(dto.password, interviewer.password);
        if (!isPasswordValid) {
            throw new AuthError_1.InvalidCredentialsError();
        }
        const company = await this._companyRepository.findById(interviewer.companyId);
        if (company?.status === user_status_enum_1.UserStatus.BLOCKED) {
            throw new AuthError_1.UnauthorizedError("Your company has been blocked. Please contact admin.");
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
