import { Router } from "express";
import { makeCollegeAdminAuthController } from "@infrastructure/di/college-admin-auth.factory";
import { validateDto } from "@presentation/express/middlewares/validateDto";
import { RegisterCollegeRequestDto } from "@application/dtos/auth/collage/Request/register.collage.request.dto";
import { VerifyCollegeOtpRequestDto } from "@application/dtos/auth/collage/Request/VerifyCollegeOtpRequest.dto";
import { UpdateCollegeOnboardingDto } from "@application/dtos/auth/collage/Request/UpdateCollegeOnboarding.dto";
import { validateSchema } from "@presentation/express/middlewares/validateSchema";
import { loginSchema } from "@shared/validation";
import { authMiddleware } from "@infrastructure/di/infra.container";
import { checkRegistrationEnabled } from "@presentation/express/middlewares/registration.middleware";

import multer from "multer";

const router = Router();
const collegeAdminAuthController = makeCollegeAdminAuthController();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/login", validateSchema(loginSchema), collegeAdminAuthController.login);
router.post("/register", checkRegistrationEnabled('college'), validateDto(RegisterCollegeRequestDto), collegeAdminAuthController.register);
router.post("/verify-otp", validateDto(VerifyCollegeOtpRequestDto), collegeAdminAuthController.verifyOtp);
router.patch("/onboarding", authMiddleware.protect, validateDto(UpdateCollegeOnboardingDto), collegeAdminAuthController.updateOnboarding);
router.post("/resubmit", authMiddleware.protect, collegeAdminAuthController.resubmit);
router.post("/verification-documents", authMiddleware.protect, upload.single("file"), collegeAdminAuthController.uploadVerificationDocument);
router.delete("/verification-documents/:id", authMiddleware.protect, collegeAdminAuthController.deleteVerificationDocument);

export default router;
