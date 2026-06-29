import { Expose } from 'class-transformer';

export class PlatformSettingsResponseDTO {
    @Expose()
    id: string;

    @Expose()
    maintenanceMode: boolean;

    @Expose()
    maintenanceMessage: string;

    @Expose()
    collegeRegistration: boolean;

    @Expose()
    companyRegistration: boolean;

    @Expose()
    studentRegistration: boolean;

    @Expose()
    requireApproval: boolean;

    @Expose()
    contactEmail: string;

    @Expose()
    updatedAt: Date;
}
