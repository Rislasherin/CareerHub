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


export class RegisterOrganizationUseCase implements IRegisterOrganizationUseCase {
    constructor(
        private readonly collegeAdminRepository : ICollegeAdminRepository,
        private readonly organizationRepository : IOrganizationRepository,
        private readonly bcryptService : IBcryptService,
        private readonly jwtService : IJwtService
    ){}

    async execute(
        dto : RegisterCollegeRequestDto
    ):Promise<RegisterCollegeResponseDto>{

        const email = dto.email.toLocaleLowerCase().trim()
        const existingAdmin = await this.collegeAdminRepository.findByEmail(email)

        if(existingAdmin){
            throw new ValidationError("Admin already exists")
        }

        const existingCollege = await this.organizationRepository.findByName(dto.organizationName)
        if(existingCollege){
            throw new ValidationError("Organization already exists")
        }

        const hashPassword = await this.bcryptService.hash(dto.password)

        const organization = Organization.create({
            name:dto.organizationName,
            city:dto.city,
            state:dto.state,
            studentCountRange:dto.studentCountRange,
            status:UserStatus.ACTIVE,
            createdAt:new Date(),
            updatedAt:new Date()

        })

        const createdOrganization = await this.organizationRepository.create(organization)

        const collegeAdmin = CollegeAdmin.create({
            firstName:dto.firstName,
            lastName:dto.lastName,
            email:dto.email,
            password:dto.password,
            orgId:createdOrganization.id ?? "",
            role:Role.COLLEGE_ADMIN,
            status:UserStatus.ACTIVE,
            createdAt:new Date(),
            updatedAt:new Date(),
        })

        const createdAdmin = await this.collegeAdminRepository.create(collegeAdmin)
        
        //jwt
        const payload = {
            id : createdAdmin.id ?? '',
            role:Role.COLLEGE_ADMIN,
            orgId:createdAdmin.orgId,
        }

        //generate token
        const accessToken =  this.jwtService.signAccessToken(payload)
        const refreshToken = this.jwtService.signRefreshToken(payload)

        return {
            accessToken,
            refreshToken,
            collegeAdmin:{
                id:createdAdmin.id ?? '',
                firstName:createdAdmin.firstName,
                lastName:createdAdmin.lastName,
                email:createdAdmin.email,
                role:createdAdmin.role,
                status:createdAdmin.status,
                orgId:createdAdmin.orgId
            },
        };
        



    }
}