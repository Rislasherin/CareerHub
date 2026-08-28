import { Router } from "express";
import { makePlatformSettingsController, makeSuperAdminController } from "@infrastructure/di/super-admin.factory";
import { notificationController } from "@infrastructure/di/notification.factory";
import { authMiddleware } from "@infrastructure/di/infra.container";

const router = Router();
const superAdminController = makeSuperAdminController();
const platformSettingsController = makePlatformSettingsController();

// Protect all Super Admin routes
router.use(authMiddleware.protect);

router.get("/dashboard/stats", superAdminController.getStats);
router.get("/organizations", superAdminController.getOrganizations);
router.get("/students", superAdminController.getStudents);
router.get("/companies", superAdminController.getCompanies);

router.get("/billing", superAdminController.getBillingInvoices);
router.post("/billing/subscriptions/:id/remind", superAdminController.sendRenewalReminder);
router.get("/revenue/analytics", superAdminController.getRevenueAnalytics);

// Super Admin Profile endpoints
router.get("/profile", superAdminController.getProfile);
router.patch("/profile", superAdminController.updateProfile);
router.post("/change-password", superAdminController.changePassword);
router.post("/request-email-change", superAdminController.requestEmailChange);
router.post("/verify-email-change", superAdminController.verifyEmailChange);

// Management actions
router.patch("/management/:role/:id/status", superAdminController.updateStatus);
router.patch("/organizations/:id/plan", superAdminController.updateOrganizationPlan);
router.patch("/organizations/:id/extend-trial", superAdminController.extendTrial);
router.delete("/management/:role/:id", superAdminController.deleteUser);

// Platform Settings
router.get("/platform-settings", platformSettingsController.getSettings);
router.patch("/platform-settings", platformSettingsController.updateSettings);

router.get("/notifications", notificationController.getMyNotifications);
router.patch("/notifications/mark-all-read", notificationController.markAllAsRead);
router.patch("/notifications/:id/read", notificationController.markAsRead);

export default router;
