"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const container_1 = require("@infrastructure/di/container");
const routes_constants_1 = require("@shared/constants/routes.constants");
const router = (0, express_1.Router)();
router.get(routes_constants_1.ROUTES.DASHBOARD.ME, container_1.container.authMiddleware.protect, container_1.container.dashboardController.me);
exports.default = router;
