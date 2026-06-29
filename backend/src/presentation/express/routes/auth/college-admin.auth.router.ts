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

const router = Router();
const collegeAdminAuthController = makeCollegeAdminAuthController();

router.post("/login", validateSchema(loginSchema), collegeAdminAuthController.login);
router.post("/register", checkRegistrationEnabled('college'), validateDto(RegisterCollegeRequestDto), collegeAdminAuthController.register);
router.post("/verify-otp", validateDto(VerifyCollegeOtpRequestDto), collegeAdminAuthController.verifyOtp);
router.patch("/onboarding", authMiddleware.protect, validateDto(UpdateCollegeOnboardingDto), collegeAdminAuthController.updateOnboarding);

export default router;
