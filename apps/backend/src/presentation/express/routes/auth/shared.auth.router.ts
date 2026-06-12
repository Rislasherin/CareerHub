import { Router } from "express";
import {
    jwtService,
    studentRepository,
    hrUserRepository,
    interviewerRepository,
    collegeAdminRepository,
    superAdminRepository,
    authMiddleware
} from "@infrastructure/di/infra.container";
import { RefreshTokenController } from "@presentation/http/controllers/auth/RefreshToken.controller";
import { makeForgotPasswordController } from "@infrastructure/di/auth.factory";
import { validateSchema } from "@presentation/express/middlewares/validateSchema";
import { forgotPasswordSchema, resetPasswordSchema } from "@shared/validation";
import { OrganizationModel } from "@infrastructure/database/models/organizer/organization.model";

const router = Router();
const refreshTokenController = new RefreshTokenController(
    jwtService,
    studentRepository,
    hrUserRepository,
    interviewerRepository,
    collegeAdminRepository,
    superAdminRepository
);
const forgotPasswordController = makeForgotPasswordController();

router.get("/organizations/approved", async (req, res) => {
    try {
        const orgs = await OrganizationModel.find({ isDeleted: { $ne: true } });
        res.json({
            success: true,
            data: orgs.map(org => ({
                id: org._id.toString(),
                name: org.name,
                activeBranches: org.activeBranches || []
            }))
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        res.status(500).json({ success: false, message });
    }
});

router.get("/status", authMiddleware.protect, refreshTokenController.status);
router.post("/refresh-token", refreshTokenController.refresh);
router.post("/logout", refreshTokenController.logout);
router.post("/forgot-password", validateSchema(forgotPasswordSchema), forgotPasswordController.forgotPassword);
router.post("/reset-password", validateSchema(resetPasswordSchema), forgotPasswordController.resetPassword);

export default router;
