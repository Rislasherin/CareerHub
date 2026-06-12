"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerifyComptypeOtpUseCase = void 0;
const AppError_1 = require("@application/errors/AppError");
const HttpStatus_enum_1 = require("@domain/enums/HttpStatus.enum");
const ErrorCodes_enum_1 = require("@domain/enums/ErrorCodes.enum");
const Roles_enum_1 = require("@domain/enums/Roles.enum");
const user_status_enum_1 = require("@domain/enums/user.status.enum");
class VerifyComptypeOtpUseCase {
    constructor(_otpRepository, _hrUserRepository, _comptypeRepository, _jwtService) {
        this._otpRepository = _otpRepository;
        this._hrUserRepository = _hrUserRepository;
        this._comptypeRepository = _comptypeRepository;
        this._jwtService = _jwtService;
    }
    async execute(dto) {
        const validOtp = await this._otpRepository.findByEmailAndOtp(dto.email, dto.otp);
        if (!validOtp) {
            throw new AppError_1.AppError("Invalid or expired OTP", HttpStatus_enum_1.HttpStatus.BAD_REQUEST, ErrorCodes_enum_1.ErrorCode.INVALID_CREDENTIALS);
        }
        // OTP is valid. Now activate the HR User and Comptype
        const hrUser = await this._hrUserRepository.findByEmail(dto.email);
        if (!hrUser) {
            throw new AppError_1.AppError("User not found", HttpStatus_enum_1.HttpStatus.NOT_FOUND, ErrorCodes_enum_1.ErrorCode.USER_NOT_FOUND);
        }
        const comptype = await this._comptypeRepository.findById(hrUser.comptypeId);
        if (!comptype) {
            throw new AppError_1.AppError("Comptype not found", HttpStatus_enum_1.HttpStatus.NOT_FOUND, ErrorCodes_enum_1.ErrorCode.USER_NOT_FOUND);
        }
        // Activate to pending onboarding state
        hrUser.status = user_status_enum_1.UserStatus.PENDING;
        await this._hrUserRepository.update(hrUser.id, hrUser);
        comptype.status = user_status_enum_1.UserStatus.PENDING;
        await this._comptypeRepository.update(comptype.id, comptype);
        // Delete OTP after successful verification
        await this._otpRepository.deleteByEmail(dto.email);
        // Generate Tokens
        const payload = {
            id: hrUser.id,
            role: Roles_enum_1.Role.HR,
            comptypeId: comptype.id,
        };
        const accessToken = this._jwtService.signAccessToken(payload);
        const refreshToken = this._jwtService.signRefreshToken(payload);
        return {
            accessToken,
            refreshToken,
            comptype: comptype.toJSON(),
            hrUser: {
                id: hrUser.id,
                firstName: hrUser.firstName,
                lastName: hrUser.lastName,
                email: hrUser.email,
                role: hrUser.role,
            },
        };
    }
}
exports.VerifyComptypeOtpUseCase = VerifyComptypeOtpUseCase;
