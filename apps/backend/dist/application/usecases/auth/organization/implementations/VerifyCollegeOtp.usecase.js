"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerifyCollegeOtpUseCase = void 0;
const AppError_1 = require("@application/errors/AppError");
const HttpStatus_enum_1 = require("@domain/enums/HttpStatus.enum");
const ErrorCodes_enum_1 = require("@domain/enums/ErrorCodes.enum");
const Roles_enum_1 = require("@domain/enums/Roles.enum");
const user_status_enum_1 = require("@domain/enums/user.status.enum");
class VerifyCollegeOtpUseCase {
    constructor(_otpRepository, _collegeAdminRepository, _organizationRepository, _jwtService) {
        this._otpRepository = _otpRepository;
        this._collegeAdminRepository = _collegeAdminRepository;
        this._organizationRepository = _organizationRepository;
        this._jwtService = _jwtService;
    }
    async execute(dto) {
        const validOtp = await this._otpRepository.findByEmailAndOtp(dto.email, dto.otp);
        if (!validOtp) {
            throw new AppError_1.AppError("Invalid or expired OTP", HttpStatus_enum_1.HttpStatus.BAD_REQUEST, ErrorCodes_enum_1.ErrorCode.INVALID_CREDENTIALS);
        }
        // Activate the College Admin and Organization
        const collegeAdmin = await this._collegeAdminRepository.findByEmail(dto.email);
        if (!collegeAdmin) {
            throw new AppError_1.AppError("Admin not found", HttpStatus_enum_1.HttpStatus.NOT_FOUND, ErrorCodes_enum_1.ErrorCode.USER_NOT_FOUND);
        }
        const organization = await this._organizationRepository.findById(collegeAdmin.orgId);
        if (!organization) {
            throw new AppError_1.AppError("Organization not found", HttpStatus_enum_1.HttpStatus.NOT_FOUND, ErrorCodes_enum_1.ErrorCode.USER_NOT_FOUND);
        }
        // Activate
        collegeAdmin.status = user_status_enum_1.UserStatus.ACTIVE;
        await this._collegeAdminRepository.update(collegeAdmin.id, collegeAdmin);
        organization.status = user_status_enum_1.UserStatus.ACTIVE;
        await this._organizationRepository.update(organization.id, organization);
        // Delete OTP after successful verification
        await this._otpRepository.deleteByEmail(dto.email);
        // Generate Tokens
        const payload = {
            id: collegeAdmin.id,
            role: Roles_enum_1.Role.COLLEGE_ADMIN,
            orgId: organization.id,
        };
        const accessToken = this._jwtService.signAccessToken(payload);
        const refreshToken = this._jwtService.signRefreshToken(payload);
        return {
            accessToken,
            refreshToken,
            collegeAdmin: {
                id: collegeAdmin.id,
                firstName: collegeAdmin.firstName,
                lastName: collegeAdmin.lastName,
                email: collegeAdmin.email,
                role: collegeAdmin.role,
                status: collegeAdmin.status,
                orgId: collegeAdmin.orgId
            },
        };
    }
}
exports.VerifyCollegeOtpUseCase = VerifyCollegeOtpUseCase;
