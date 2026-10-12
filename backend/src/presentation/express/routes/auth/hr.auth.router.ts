import { Router } from "express";
import { makeHRAuthController } from "@infrastructure/di/hr.factory";
import { RegisterCompanyRequestDto } from "@application/dtos/auth/hr/Request/RegisterCompanyRequest.dto";
import { UpdateCompanyOnboardingDto } from "@application/dtos/auth/hr/Request/UpdateCompanyOnboarding.dto";
import { VerifyCompanyOtpRequestDto } from "@application/dtos/auth/hr/Request/VerifyCompanyOtpRequest.dto";
import { validateDto } from "@presentation/express/middlewares/validateDto";
import { authMiddleware } from "@infrastructure/di/infra.container";
import { validateSchema } from "@presentation/express/middlewares/validateSchema";
import { loginSchema } from "@shared/validation";
import { checkRegistrationEnabled } from "@presentation/express/middlewares/registration.middleware";

import multer from "multer";

const router = Router();
const hrAuthController = makeHRAuthController();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/login", validateSchema(loginSchema), hrAuthController.login);
router.post("/register", checkRegistrationEnabled('company'), validateDto(RegisterCompanyRequestDto), hrAuthController.register);
router.post("/verify-otp", validateDto(VerifyCompanyOtpRequestDto), hrAuthController.verifyOtp);
router.patch("/onboarding", authMiddleware.protect, validateDto(UpdateCompanyOnboardingDto), hrAuthController.updateOnboarding);
router.post("/resubmit", authMiddleware.protect, hrAuthController.resubmit);
router.post("/verification-documents", authMiddleware.protect, upload.single("file"), hrAuthController.uploadVerificationDocument);
router.delete("/verification-documents/:id", authMiddleware.protect, hrAuthController.deleteVerificationDocument);

export default router;
