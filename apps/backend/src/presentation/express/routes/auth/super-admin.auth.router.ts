import { Router } from "express";
import { makeSuperAdminAuthController } from "@infrastructure/di/super-admin.factory";
import { validateSchema } from "@presentation/express/middlewares/validateSchema";
import { loginSchema } from "@shared/validation";

const router = Router();
const superAdminAuthController = makeSuperAdminAuthController();

router.post("/login", validateSchema(loginSchema), superAdminAuthController.login);

export default router;
