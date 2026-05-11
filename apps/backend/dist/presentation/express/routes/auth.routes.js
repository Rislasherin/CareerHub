"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const route_constants_1 = require("@shared/constants/route.constants");
const container_1 = require("@infrastructure/di/container");
const validate_dto_middleware_1 = require("@presentation/express/middlewares/validate-dto.middleware");
const login_request_dto_1 = require("@application/dtos/auth/request/login.request.dto");
const forgot_password_request_dto_1 = require("@application/dtos/auth/request/forgot-password.request.dto");
const reset_password_request_dto_1 = require("@application/dtos/auth/request/reset-password.request.dto");
const student_set_password_request_dto_1 = require("@application/dtos/auth/request/student-set-password.request.dto");
const role_enum_1 = require("@domain/enums/role.enum");
const router = (0, express_1.Router)();
const authRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
});
router.use(authRateLimiter);
const assignRole = (role) => (request, _response, next) => {
    request.body = {
        ...request.body,
        role,
    };
    next();
};
router.post(route_constants_1.API_ROUTES.AUTH.STUDENT_LOGIN, assignRole(role_enum_1.Role.STUDENT), (0, validate_dto_middleware_1.validateDto)(login_request_dto_1.LoginRequestDto), container_1.container.authController.login);
router.post(route_constants_1.API_ROUTES.AUTH.COLLEGE_ADMIN_LOGIN, assignRole(role_enum_1.Role.COLLEGE_ADMIN), (0, validate_dto_middleware_1.validateDto)(login_request_dto_1.LoginRequestDto), container_1.container.authController.login);
router.post(route_constants_1.API_ROUTES.AUTH.HR_LOGIN, assignRole(role_enum_1.Role.HR), (0, validate_dto_middleware_1.validateDto)(login_request_dto_1.LoginRequestDto), container_1.container.authController.login);
router.post(route_constants_1.API_ROUTES.AUTH.INTERVIEWER_LOGIN, assignRole(role_enum_1.Role.INTERVIEWER), (0, validate_dto_middleware_1.validateDto)(login_request_dto_1.LoginRequestDto), container_1.container.authController.login);
router.post(route_constants_1.API_ROUTES.AUTH.SUPER_ADMIN_LOGIN, assignRole(role_enum_1.Role.SUPER_ADMIN), (0, validate_dto_middleware_1.validateDto)(login_request_dto_1.LoginRequestDto), container_1.container.authController.login);
router.post(route_constants_1.API_ROUTES.AUTH.FORGOT_PASSWORD, (0, validate_dto_middleware_1.validateDto)(forgot_password_request_dto_1.ForgotPasswordRequestDto), container_1.container.authController.forgotPassword);
router.post(route_constants_1.API_ROUTES.AUTH.RESET_PASSWORD, (0, validate_dto_middleware_1.validateDto)(reset_password_request_dto_1.ResetPasswordRequestDto), container_1.container.authController.resetPassword);
router.post(route_constants_1.API_ROUTES.AUTH.REFRESH, container_1.container.authController.refresh);
router.post(route_constants_1.API_ROUTES.AUTH.LOGOUT, container_1.container.authMiddleware.requireAuth, container_1.container.authController.logout);
router.post(route_constants_1.API_ROUTES.AUTH.STUDENT_SET_PASSWORD, container_1.container.authMiddleware.requireAuth, container_1.container.authMiddleware.requireRoles([role_enum_1.Role.STUDENT]), (0, validate_dto_middleware_1.validateDto)(student_set_password_request_dto_1.StudentSetPasswordRequestDto), container_1.container.authController.studentSetPassword);
exports.default = router;
