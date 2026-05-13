"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterOrganizationUseCase = void 0;
const CollegeAdmin_1 = require("@domain/entities/CollegeAdmin");
const Organization_1 = require("@domain/entities/Organization");
const Roles_enum_1 = require("@domain/enums/Roles.enum");
const user_status_enum_1 = require("@domain/enums/user.status.enum");
const validation_error_1 = require("@application/errors/validation.error");
class RegisterOrganizationUseCase {
    constructor(collegeAdminRepository, organizationRepository, bcryptService, jwtService, otpRepository, emailService) {
        this.collegeAdminRepository = collegeAdminRepository;
        this.organizationRepository = organizationRepository;
        this.bcryptService = bcryptService;
        this.jwtService = jwtService;
        this.otpRepository = otpRepository;
        this.emailService = emailService;
    }
    async execute(dto) {
        const email = dto.email.toLocaleLowerCase().trim();
        const existingAdmin = await this.collegeAdminRepository.findByEmail(email);
        if (existingAdmin) {
            throw new validation_error_1.ValidationError("Admin already exists");
        }
        const existingCollege = await this.organizationRepository.findByName(dto.organizationName);
        if (existingCollege) {
            throw new validation_error_1.ValidationError("Organization already exists");
        }
        const hashPassword = await this.bcryptService.hash(dto.password);
        const organization = Organization_1.Organization.create({
            name: dto.organizationName,
            city: dto.city,
            state: dto.state || "N/A",
            studentCountRange: dto.studentCountRange || "Not Specified",
            status: user_status_enum_1.UserStatus.PENDING,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        const createdOrganization = await this.organizationRepository.create(organization);
        const collegeAdmin = CollegeAdmin_1.CollegeAdmin.create({
            firstName: dto.firstName,
            lastName: dto.lastName,
            email: dto.email,
            password: hashPassword,
            orgId: createdOrganization.id ?? "",
            role: Roles_enum_1.Role.COLLEGE_ADMIN,
            status: user_status_enum_1.UserStatus.PENDING,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        const createdAdmin = await this.collegeAdminRepository.create(collegeAdmin);
        // Generate and save OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        console.log(`[OTP GENERATED] College Admin Email: ${dto.email}, OTP: ${otp}`);
        await this.otpRepository.create(dto.email, otp);
        // Send OTP Email
        await this.emailService.sendOTP(dto.email, otp, dto.organizationName);
        return {
            requiresOtp: true,
            email: dto.email,
            message: "An OTP has been sent to your college admin email."
        };
    }
}
exports.RegisterOrganizationUseCase = RegisterOrganizationUseCase;
