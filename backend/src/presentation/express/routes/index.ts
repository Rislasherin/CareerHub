import { Router } from "express";
import studentAuthRoutes from "./auth/student.auth.router";
import hrAuthRoutes from "./auth/hr.auth.router";
import interviewerAuthRoutes from "./auth/interviewer.auth.router";
import collegeAdminAuthRoutes from "./auth/college-admin.auth.router";
import superAdminAuthRoutes from "./auth/super-admin.auth.router";
import sharedAuthRoutes from "./auth/shared.auth.router";
import collegeRouter from "./college/college.router";
import hrRouter from "./hr/hr.router";
import superAdminRouter from "./super-admin/super-admin.router";
import studentRouter from "./student/student.router";
import { makeStudentManagementController } from "@infrastructure/di/college.factory";
import { ROUTES } from "@shared/constants/routes.constants";
import { maintenanceMiddleware } from "../middlewares/maintenance.middleware";
import skillRouter from "./skill.router";

const router = Router();

// Apply Maintenance Mode block globally
router.use(maintenanceMiddleware);

router.use(`${ROUTES.AUTH.BASE}${ROUTES.AUTH.STUDENT}`, studentAuthRoutes);
router.use(`${ROUTES.AUTH.BASE}${ROUTES.AUTH.HR}`, hrAuthRoutes);
router.use(`${ROUTES.AUTH.BASE}${ROUTES.AUTH.INTERVIEWER}`, interviewerAuthRoutes);
router.use(`${ROUTES.AUTH.BASE}${ROUTES.AUTH.COLLEGE_ADMIN}`, collegeAdminAuthRoutes);
router.use(`${ROUTES.AUTH.BASE}${ROUTES.AUTH.SUPER_ADMIN}`, superAdminAuthRoutes);
router.use(ROUTES.AUTH.BASE, sharedAuthRoutes);
router.use("/college", collegeRouter);
router.use("/hr", hrRouter);
router.use("/student", studentRouter);
router.use("/super-admin", superAdminRouter);
router.use("/skills", skillRouter);

export default router;
