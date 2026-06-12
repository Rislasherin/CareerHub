"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthMiddleware = void 0;
const AuthError_1 = require("@application/errors/AuthError");
const user_status_enum_1 = require("@domain/enums/user.status.enum");
const Roles_enum_1 = require("@domain/enums/Roles.enum");
class AuthMiddleware {
    constructor(_jwtService, _studentRepository, _hrUserRepository, _interviewerRepository, _collegeAdminRepository, _superAdminRepository, _organizationRepository, _companyRepository) {
        this._jwtService = _jwtService;
        this._studentRepository = _studentRepository;
        this._hrUserRepository = _hrUserRepository;
        this._interviewerRepository = _interviewerRepository;
        this._collegeAdminRepository = _collegeAdminRepository;
        this._superAdminRepository = _superAdminRepository;
        this._organizationRepository = _organizationRepository;
        this._companyRepository = _companyRepository;
        this.protect = async (req, _res, next) => {
            try {
                let token;
                if (req.cookies && req.cookies.accessToken) {
                    token = req.cookies.accessToken;
                }
                else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
                    token = req.headers.authorization.split(" ")[1];
                }
                if (!token) {
                    throw new AuthError_1.UnauthorizedError("Access token missing");
                }
                const decoded = this._jwtService.verifyAccessToken(token);
                // Real-time status check to handle automatic logout if blocked
                let user;
                switch (decoded.role) {
                    case Roles_enum_1.Role.STUDENT:
                        user = await this._studentRepository.findById(decoded.id);
                        break;
                    case Roles_enum_1.Role.HR:
                        user = await this._hrUserRepository.findById(decoded.id);
                        if (user && user.companyId) {
                            const company = await this._companyRepository.findById(user.companyId);
                            if (company) {
                                const userJson = user.toJSON ? user.toJSON() : user;
                                const companyJson = company.toJSON ? company.toJSON() : company;
                                // Check if company is blocked
                                if (companyJson.status === user_status_enum_1.UserStatus.BLOCKED) {
                                    throw new AuthError_1.UnauthorizedError("Your company has been blocked. Please contact admin.");
                                }
                                user = { ...userJson, onboardingStep: companyJson.onboardingStep };
                            }
                        }
                        break;
                    case Roles_enum_1.Role.INTERVIEWER:
                        user = await this._interviewerRepository.findById(decoded.id);
                        if (user && user.companyId) {
                            const company = await this._companyRepository.findById(user.companyId);
                            if (company && company.status === user_status_enum_1.UserStatus.BLOCKED) {
                                throw new AuthError_1.UnauthorizedError("Your company has been blocked. Please contact admin.");
                            }
                        }
                        break;
                    case Roles_enum_1.Role.COLLEGE_ADMIN:
                        user = await this._collegeAdminRepository.findById(decoded.id);
                        if (user && user.orgId) {
                            const org = await this._organizationRepository.findById(user.orgId);
                            if (org) {
                                const userJson = user.toJSON ? user.toJSON() : user;
                                const orgJson = org.toJSON ? org.toJSON() : org;
                                // Check if organization is blocked
                                if (orgJson.status === user_status_enum_1.UserStatus.BLOCKED) {
                                    throw new AuthError_1.UnauthorizedError("Your institution has been blocked. Please contact admin.");
                                }
                                user = { ...userJson, onboardingStep: orgJson.onboardingStep };
                            }
                        }
                        break;
                    case Roles_enum_1.Role.SUPER_ADMIN:
                        user = await this._superAdminRepository.findById(decoded.id);
                        break;
                }
                if (!user || user.status === user_status_enum_1.UserStatus.BLOCKED) {
                    throw new AuthError_1.UnauthorizedError("Your account has been blocked or no longer exists.");
                }
                const userData = user.toJSON ? user.toJSON() : (user.toObject ? user.toObject() : user);
                req.user = { ...decoded, ...userData };
                next();
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.AuthMiddleware = AuthMiddleware;
