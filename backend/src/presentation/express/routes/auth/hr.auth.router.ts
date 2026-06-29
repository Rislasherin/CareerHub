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

const router = Router();
const hrAuthController = makeHRAuthController();

router.post("/login", validateSchema(loginSchema), hrAuthController.login);
router.post("/register", checkRegistrationEnabled('company'), validateDto(RegisterCompanyRequestDto), hrAuthController.register);
router.post("/verify-otp", validateDto(VerifyCompanyOtpRequestDto), hrAuthController.verifyOtp);
router.patch("/onboarding", authMiddleware.protect, validateDto(UpdateCompanyOnboardingDto), hrAuthController.updateOnboarding);

export default router;
