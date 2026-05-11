import { Router } from "express";
import { makeHRAuthController } from "@infrastructure/di/hr.factory";
import { RegisterCompanyRequestDto } from "@application/dtos/auth/hr/Request/RegisterCompanyRequest.dto";
import { UpdateCompanyOnboardingDto } from "@application/dtos/auth/hr/Request/UpdateCompanyOnboarding.dto";
import { validateDto } from "@presentation/express/middlewares/validateDto";
import { authMiddleware } from "@infrastructure/di/infra.container";

const router = Router();
const hrAuthController = makeHRAuthController();

router.post("/register", validateDto(RegisterCompanyRequestDto), hrAuthController.register);
router.patch("/onboarding", authMiddleware.protect, validateDto(UpdateCompanyOnboardingDto), hrAuthController.updateOnboarding);

export default router;
