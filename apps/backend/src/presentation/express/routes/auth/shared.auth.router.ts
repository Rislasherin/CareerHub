import { Router } from "express";
import { jwtService } from "@infrastructure/di/infra.container";
import { RefreshTokenController } from "@presentation/http/controllers/auth/RefreshToken.controller";

const router = Router();
const refreshTokenController = new RefreshTokenController(jwtService);

router.post("/refresh-token", refreshTokenController.refresh);
router.post("/logout", refreshTokenController.logout);

export default router;
