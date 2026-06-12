"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const infra_container_1 = require("@infrastructure/di/infra.container");
const RefreshToken_controller_1 = require("@presentation/http/controllers/auth/RefreshToken.controller");
const auth_factory_1 = require("@infrastructure/di/auth.factory");
const validateSchema_1 = require("@presentation/express/middlewares/validateSchema");
const validation_1 = require("@shared/validation");
const organization_model_1 = require("@infrastructure/database/models/organizer/organization.model");
const router = (0, express_1.Router)();
const refreshTokenController = new RefreshToken_controller_1.RefreshTokenController(infra_container_1.jwtService, infra_container_1.studentRepository, infra_container_1.hrUserRepository, infra_container_1.interviewerRepository, infra_container_1.collegeAdminRepository, infra_container_1.superAdminRepository);
const forgotPasswordController = (0, auth_factory_1.makeForgotPasswordController)();
router.get("/organizations/approved", async (req, res) => {
    try {
        const orgs = await organization_model_1.OrganizationModel.find({ isDeleted: { $ne: true } });
        res.json({
            success: true,
            data: orgs.map(org => ({
                id: org._id.toString(),
                name: org.name,
                activeBranches: org.activeBranches || []
            }))
        });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
router.get("/status", infra_container_1.authMiddleware.protect, refreshTokenController.status);
router.post("/refresh-token", refreshTokenController.refresh);
router.post("/logout", refreshTokenController.logout);
router.post("/forgot-password", (0, validateSchema_1.validateSchema)(validation_1.forgotPasswordSchema), forgotPasswordController.forgotPassword);
router.post("/reset-password", (0, validateSchema_1.validateSchema)(validation_1.resetPasswordSchema), forgotPasswordController.resetPassword);
exports.default = router;
