import { RegisterCollegeRequestDto } from "@application/dtos/auth/collage/Request/register.collage.request.dto";
import { RegisterCollegeResponseDto } from "@application/dtos/auth/collage/Response/register.college.response.sto";
import { IRegisterOrganizationUseCase } from "../interfaces/IRegister.organization.usecase";
import { ICollegeAdminRepository } from "@domain/repositories/ICollegeAdminRepository";
import { IOrganizationRepository } from "@domain/repositories/IOrganizationRepository";
import { CollegeAdmin } from "@domain/entities/CollegeAdmin";
import { Organization } from "@domain/entities/Organization";
import { IBcryptService } from "@application/interfaces/IBcryptService";
import { IJwtService } from "@application/interfaces/IJwt.service";
import { Role } from "@domain/enums/Roles.enum";
import { UserStatus } from "@domain/enums/user.status.enum";
import { ValidationError } from "@application/errors/validation.error";
import { IOtpRepository } from "@domain/repositories/IOtpRepository";
import { EmailService } from "@infrastructure/services/email/email.service";
import { CrossRoleAuthService } from "@application/services/CrossRoleAuthService";


export class RegisterOrganizationUseCase implements IRegisterOrganizationUseCase {
    constructor(
        private readonly collegeAdminRepository : ICollegeAdminRepository,
        private readonly organizationRepository : IOrganizationRepository,
        private readonly bcryptService : IBcryptService,
        private readonly jwtService : IJwtService,
        private readonly otpRepository: IOtpRepository,
        private readonly emailService: EmailService,
        private readonly crossRoleAuthService: CrossRoleAuthService
    ){}

    async execute(
        dto : RegisterCollegeRequestDto
    ):Promise<RegisterCollegeResponseDto>{

        const email = dto.email.toLocaleLowerCase().trim()
        
        const globalCheck = await this.crossRoleAuthService.isEmailInUse(email);
        if (globalCheck.inUse) {
            // Only block if it's a different role OR if it's the same role but already verified (ACTIVE)
            if (globalCheck.role !== "College Admin" || globalCheck.status !== UserStatus.PENDING) {
                throw new ValidationError(`This email is already registered as a ${globalCheck.role}`);
            }
        }

        const existingAdmin = await this.collegeAdminRepository.findByEmail(email)
        
        if (existingAdmin) {
            if (existingAdmin.status === UserStatus.PENDING) {
                // Handle Resend OTP: User exists but not verified
                const otp = Math.floor(100000 + Math.random() * 900000).toString();
                console.log(`[OTP RE-GENERATED] College Admin Email: ${email}, OTP: ${otp}`);
                await this.otpRepository.deleteByEmail(email);
                await this.otpRepository.create(email, otp);
                await this.emailService.sendOTP(email, otp, "your institution");

                return {
                    requiresOtp: true,
                    email: email,
                    message: "A new OTP has been sent to your college admin email."
                };
            }
            throw new ValidationError("Admin already exists")
        }

        const hashPassword = await this.bcryptService.hash(dto.password)

        const organization = Organization.create({
            name: `Pending Institution (${dto.firstName} ${dto.lastName}) - ${Date.now()}`,
            city: "N/A",
            state: "N/A",
            studentCountRange: "Not Specified",
            status: UserStatus.PENDING,
            onboardingStep: 0,
            createdAt: new Date(),
            updatedAt: new Date()
        })

        const createdOrganization = await this.organizationRepository.create(organization)

        const collegeAdmin = CollegeAdmin.create({
            firstName:dto.firstName,
            lastName:dto.lastName,
            email:dto.email,
            password:hashPassword,
            orgId:createdOrganization.id ?? "",
            role:Role.COLLEGE_ADMIN,
            status:UserStatus.PENDING,
            createdAt:new Date(),
            updatedAt:new Date(),
        })

        const createdAdmin = await this.collegeAdminRepository.create(collegeAdmin)
        
        // Generate and save OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        console.log(`[OTP GENERATED] College Admin Email: ${dto.email}, OTP: ${otp}`);
        await this.otpRepository.create(dto.email, otp);

        // Send OTP Email
        await this.emailService.sendOTP(dto.email, otp, "your institution");

        return {
            requiresOtp: true,
            email: dto.email,
            message: "An OTP has been sent to your college admin email."
        };
        



    }
}