"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const hr_factory_1 = require("@infrastructure/di/hr.factory");
const infra_container_1 = require("@infrastructure/di/infra.container");
const router = (0, express_1.Router)();
const interviewerManagementController = (0, hr_factory_1.makeInterviewerManagementController)();
// Protect all HR routes
router.use(infra_container_1.authMiddleware.protect);
router.post("/interviewers", interviewerManagementController.addInterviewer);
router.get("/interviewers", interviewerManagementController.getInterviewers);
router.patch("/interviewers/:interviewerId/toggle-status", interviewerManagementController.toggleStatus);
exports.default = router;
