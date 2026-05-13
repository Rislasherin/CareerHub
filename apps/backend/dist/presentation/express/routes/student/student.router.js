"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const student_factory_1 = require("@infrastructure/di/student.factory");
const infra_container_1 = require("@infrastructure/di/infra.container");
const router = (0, express_1.Router)();
const studentController = (0, student_factory_1.makeStudentController)();
// Use authMiddleware.protect for all routes in this router
router.use(infra_container_1.authMiddleware.protect);
router.get("/me", studentController.getMe);
router.post("/verify", studentController.uploadVerification);
exports.default = router;
