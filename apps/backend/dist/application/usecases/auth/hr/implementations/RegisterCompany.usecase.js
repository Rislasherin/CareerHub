"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterComptypeUseCase = void 0;
const Comptype_1 = require("@domain/entities/Comptype");
const HRUser_1 = require("@domain/entities/HRUser");
const user_status_enum_1 = require("@domain/enums/user.status.enum");
const Roles_enum_1 = require("@domain/enums/Roles.enum");
const AppError_1 = require("@application/errors/AppError");
const HttpStatus_enum_1 = require("@domain/enums/HttpStatus.enum");
const ErrorCodes_enum_1 = require("@domain/enums/ErrorCodes.enum");
class RegisterComptypeUseCase {
    constructor(_comptypeRepository, _hrUserRepository, _bcryptService, _jwtService, _otpRepository, _emailService, _crossRoleAuthService) {
        this._comptypeRepository = _comptypeRepository;
        this._hrUserRepository = _hrUserRepository;
        this._bcryptService = _bcryptService;
        this._jwtService = _jwtService;
        this._otpRepository = _otpRepository;
        this._emailService = _emailService;
        this._crossRoleAuthService = _crossRoleAuthService;
    }
    async execute(dto) {
        const globalCheck = await this._crossRoleAuthService.isEmailInUse(dto.email);
        if (globalCheck.inUse) {
            // Only block if it's a different role OR if it's the same role but already verified (ACTIVE)
            if (globalCheck.role !== "HR" || globalCheck.status !== user_status_enum_1.UserStatus.PENDING) {
                throw new AppError_1.AppError(`This email is already registered as a ${globalCheck.role}`, HttpStatus_enum_1.HttpStatus.BAD_REQUEST, ErrorCodes_enum_1.ErrorCode.USER_ALREADY_EXISTS);
            }
        }
        const existingUser = await this._hrUserRepository.findByEmail(dto.email);
        if (existingUser) {
            if (existingUser.status === user_status_enum_1.UserStatus.PENDING) {
                // Handle Resend OTP: User exists but not verified
                const otp = Math.floor(100000 + Math.random() * 900000).toString();
                console.log(`[OTP RE-GENERATED] Email: ${dto.email}, OTP: ${otp}`);
                await this._otpRepository.deleteByEmail(dto.email);
                await this._otpRepository.create(dto.email, otp);
                await this._emailService.sendOTP(dto.email, otp, "New Comptype");
                return {
                    requiresOtp: true,
                    email: dto.email,
                    message: "A new OTP has been sent to your email.",
                };
            }
            throw new AppError_1.AppError("HR User with this email already exists", HttpStatus_enum_1.HttpStatus.BAD_REQUEST, ErrorCodes_enum_1.ErrorCode.USER_ALREADY_EXISTS);
        }
        // Step 1: Create Comptype (pending)
        const comptype = await this._comptypeRepository.create(Comptype_1.Comptype.create({
            name: `Pending Comptype (${dto.firstName} ${dto.lastName}) - ${Date.now()}`,
            onboardingStep: 0,
            status: user_status_enum_1.UserStatus.PENDING,
        }));
        const hashedPassword = await this._bcryptService.hash(dto.password);
        // Step 2: Create HR User (pending)
        const hrUser = await this._hrUserRepository.create(HRUser_1.HRUser.create({
            comptypeId: comptype.id,
            firstName: dto.firstName,
            lastName: dto.lastName,
            email: dto.email,
            password: hashedPassword,
            designation: dto.jobTitle,
            role: Roles_enum_1.Role.HR,
            status: user_status_enum_1.UserStatus.PENDING,
        }));
        // Step 3: Generate and save OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        console.log(`[OTP GENERATED] Email: ${dto.email}, OTP: ${otp}`); // As requested by user
        await this._otpRepository.create(dto.email, otp);
        // Step 4: Send OTP Email
        await this._emailService.sendOTP(dto.email, otp, "New Comptype");
        return {
            requiresOtp: true,
            email: dto.email,
            message: "An OTP has been sent to your email.",
        };
    }
}
exports.RegisterComptypeUseCase = RegisterComptypeUseCase;
