import { Request, Response, NextFunction } from "express";
import { PlatformSettingsRepository } from "@infrastructure/repositories/PlatformSettingsRepository";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";

const platformSettingsRepository = new PlatformSettingsRepository();

export const maintenanceMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const settings = await platformSettingsRepository.getSettings();
        
        // If maintenance mode is OFF, let the request pass
        if (!settings || !settings.maintenanceMode) {
            return next();
        }

        // Allow super admin routes to bypass maintenance mode (so they can turn it off!)
        if (req.originalUrl.includes("/api/super-admin") || req.originalUrl.includes("/api/auth/super-admin")) {
            return next();
        }

        // Allow authentication refresh routes so users don't randomly get logged out
        if (req.originalUrl.includes("/auth/refresh-token") || req.originalUrl.includes("/auth/logout") || req.originalUrl.includes("/auth/status")) {
            return next();
        }

        // Otherwise, block the request with a 503 Maintenance Mode status
        return res.status(HttpStatus.SERVICE_UNAVAILABLE).json({
            success: false,
            error: {
                code: "MAINTENANCE_MODE",
                message: settings.maintenanceMessage || "Platform is currently under maintenance. Please try again later."
            }
        });
    } catch (error) {
        // If DB fails, just let it pass to not break the whole platform
        next();
    }
};
