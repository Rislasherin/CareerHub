import { Schema } from "mongoose";

export const platformSettingsSchema = new Schema(
    {
        maintenanceMode: {
            type: Boolean,
            default: false
        },
        maintenanceMessage: {
            type: String,
            default: "We are currently undergoing scheduled maintenance. Please check back shortly.",
        },
        collegeRegistration: {
            type: Boolean,
            default: true,
        },
        companyRegistration: {
            type: Boolean,
            default: true,
        },
        studentRegistration: {
            type: Boolean,
            default: true
        },
        requireApproval: {
            type: Boolean,
            default: true,
        },
        contactEmail: {
            type: String,
            default: "support@careerhub.com",
        },
    },
    {
        timestamps: true
    },
)