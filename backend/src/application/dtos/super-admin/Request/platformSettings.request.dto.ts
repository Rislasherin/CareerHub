import { IsBoolean, IsString, IsEmail, IsNotEmpty } from 'class-validator';

export class UpdatePlatformSettingsDTO {
    @IsBoolean()
    maintenanceMode: boolean;

    @IsString()
    @IsNotEmpty()
    maintenanceMessage: string;

    @IsBoolean()
    collegeRegistration: boolean;

    @IsBoolean()
    companyRegistration: boolean;

    @IsBoolean()
    studentRegistration: boolean;

    @IsBoolean()
    requireApproval: boolean;

    @IsEmail()
    @IsNotEmpty()
    contactEmail: string;
}
