import { PlatformSettings } from "@domain/entities/PlatformSettings"
import { PlatformSettingsDocument } from "@infrastructure/database/models/superadmin/platformSettings.model"

export const toPlatformSettingsEntity = (doc: PlatformSettingsDocument): PlatformSettings => {
    return PlatformSettings.create({
        id: doc._id.toString(),
        maintenanceMode: Boolean(doc.maintenanceMode),
        maintenanceMessage: doc.maintenanceMessage || "System is under maintenance.",
        collegeRegistration: doc.collegeRegistration !== undefined ? doc.collegeRegistration : true,
        companyRegistration: doc.companyRegistration !== undefined ? doc.companyRegistration : true,
        studentRegistration: doc.studentRegistration !== undefined ? doc.studentRegistration : true,
        requireApproval: doc.requireApproval !== undefined ? doc.requireApproval : true,
        contactEmail: doc.contactEmail || "support@careerhub.com",
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt
    });
};
export const toPlatformSettingsPersistence = (entity: PlatformSettings): Record<string, unknown> => {
    const data = entity.toJSON();

    delete data.id;

    return data;
};

