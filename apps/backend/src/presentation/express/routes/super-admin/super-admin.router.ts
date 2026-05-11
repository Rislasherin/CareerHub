import { Router } from "express";
import { makeSuperAdminController } from "@infrastructure/di/super-admin.factory";
import { authMiddleware } from "@infrastructure/di/infra.container";

const router = Router();
const superAdminController = makeSuperAdminController();

// Protect all Super Admin routes
router.use(authMiddleware.protect);

router.get("/dashboard/stats", superAdminController.getStats);
router.get("/organizations", superAdminController.getOrganizations);
router.get("/students", superAdminController.getStudents);
router.get("/companies", superAdminController.getCompanies);
router.get("/interviewers", superAdminController.getInterviewers);

export default router;
