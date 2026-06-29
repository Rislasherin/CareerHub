import { Request, Response, NextFunction } from "express";
import { PlatformSettingsRepository } from "@infrastructure/repositories/PlatformSettingsRepository";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";

const platformSettingsRepository = new PlatformSettingsRepository();

export const checkRegistrationEnabled = (type: 'student' | 'company' | 'college') => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const settings = await platformSettingsRepository.getSettings();
            
            // If settings don't exist, default to true
            if (!settings) {
                return next();
            }

            let isEnabled = true;

            switch (type) {
                case 'student':
                    isEnabled = settings.studentRegistration;
                    break;
                case 'company':
                    isEnabled = settings.companyRegistration;
                    break;
                case 'college':
                    isEnabled = settings.collegeRegistration;
                    break;
            }

            if (!isEnabled) {
                return res.status(HttpStatus.FORBIDDEN).json({
                    success: false,
                    error: {
                        code: "REGISTRATION_DISABLED",
                        message: `New ${type} registrations are currently disabled by the administrator.`
                    }
                });
            }

            next();
        } catch (error) {
            next();
        }
    };
};
