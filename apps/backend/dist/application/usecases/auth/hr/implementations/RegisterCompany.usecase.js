"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterCompanyUseCase = void 0;
const Company_1 = require("@domain/entities/Company");
const HRUser_1 = require("@domain/entities/HRUser");
const user_status_enum_1 = require("@domain/enums/user.status.enum");
const Roles_enum_1 = require("@domain/enums/Roles.enum");
const AppError_1 = require("@application/errors/AppError");
const HttpStatus_enum_1 = require("@domain/enums/HttpStatus.enum");
const ErrorCodes_enum_1 = require("@domain/enums/ErrorCodes.enum");
class RegisterCompanyUseCase {
    constructor(_companyRepository, _hrUserRepository, _bcryptService, _jwtService, _otpRepository, _emailService) {
        this._companyRepository = _companyRepository;
        this._hrUserRepository = _hrUserRepository;
        this._bcryptService = _bcryptService;
        this._jwtService = _jwtService;
        this._otpRepository = _otpRepository;
        this._emailService = _emailService;
    }
    async execute(dto) {
        const existingUser = await this._hrUserRepository.findByEmail(dto.email);
        if (existingUser) {
            throw new AppError_1.AppError("HR User with this email already exists", HttpStatus_enum_1.HttpStatus.BAD_REQUEST, ErrorCodes_enum_1.ErrorCode.USER_ALREADY_EXISTS);
        }
        // Step 1: Create Company (pending)
        const company = await this._companyRepository.create(Company_1.Company.create({
            name: dto.companyName,
            onboardingStep: 1,
            status: "pending",
        }));
        const hashedPassword = await this._bcryptService.hash(dto.password);
        // Step 2: Create HR User (pending)
        const hrUser = await this._hrUserRepository.create(HRUser_1.HRUser.create({
            companyId: company.id,
            firstName: dto.firstName,
            lastName: dto.lastName,
            email: dto.email,
            password: hashedPassword,
            designation: "Admin", // Default designation for the registering HR
            role: Roles_enum_1.Role.HR,
            status: user_status_enum_1.UserStatus.PENDING,
        }));
        // Step 3: Generate and save OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        console.log(`[OTP GENERATED] Email: ${dto.email}, OTP: ${otp}`); // As requested by user
        await this._otpRepository.create(dto.email, otp);
        // Step 4: Send OTP Email
        await this._emailService.sendOTP(dto.email, otp, dto.companyName);
        return {
            requiresOtp: true,
            email: dto.email,
            message: "An OTP has been sent to your email.",
        };
    }
}
exports.RegisterCompanyUseCase = RegisterCompanyUseCase;
