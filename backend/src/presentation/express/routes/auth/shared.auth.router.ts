import { Router } from "express";
import { authMiddleware } from "@infrastructure/di/infra.container";
import { 
    makeForgotPasswordController, 
    makeRefreshTokenController,
    makePublicOrganizationController
} from "@infrastructure/di/auth.factory";
import { validateSchema } from "@presentation/express/middlewares/validateSchema";
import { forgotPasswordSchema, resetPasswordSchema } from "@shared/validation";

const router = Router();
const refreshTokenController = makeRefreshTokenController();
const forgotPasswordController = makeForgotPasswordController();
const publicOrganizationController = makePublicOrganizationController();

router.get("/organizations/approved", publicOrganizationController.getApprovedOrganizations);

router.get("/status", authMiddleware.protect, refreshTokenController.status);
router.post("/refresh-token", refreshTokenController.refresh);
router.post("/logout", refreshTokenController.logout);
router.post("/forgot-password", validateSchema(forgotPasswordSchema), forgotPasswordController.forgotPassword);
router.post("/reset-password", validateSchema(resetPasswordSchema), forgotPasswordController.resetPassword);

export default router;
