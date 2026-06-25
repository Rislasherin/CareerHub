"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const super_admin_factory_1 = require("@infrastructure/di/super-admin.factory");
const infra_container_1 = require("@infrastructure/di/infra.container");
const router = (0, express_1.Router)();
const superAdminController = (0, super_admin_factory_1.makeSuperAdminController)();
// Protect all Super Admin routes
router.use(infra_container_1.authMiddleware.protect);
router.get("/dashboard/stats", superAdminController.getStats);
router.get("/organizations", superAdminController.getOrganizations);
router.get("/students", superAdminController.getStudents);
router.get("/companies", superAdminController.getCompanies);
router.get("/interviewers", superAdminController.getInterviewers);
// Management actions
router.patch("/management/:role/:id/status", superAdminController.updateStatus);
router.patch("/organizations/:id/plan", superAdminController.updateOrganizationPlan);
router.delete("/management/:role/:id", superAdminController.deleteUser);
exports.default = router;
