"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const college_factory_1 = require("@infrastructure/di/college.factory");
const infra_container_1 = require("@infrastructure/di/infra.container");
const validateDto_1 = require("@presentation/express/middlewares/validateDto");
const InviteStudents_dto_1 = require("@application/dtos/auth/student/Request/InviteStudents.dto");
const router = (0, express_1.Router)();
const studentManagementController = (0, college_factory_1.makeStudentManagementController)();
// Use authMiddleware.protect for all routes in this router
router.use(infra_container_1.authMiddleware.protect);
router.get("/students/pending", studentManagementController.getPendingStudents);
router.post("/students/bulk-invite", (0, validateDto_1.validateDto)(InviteStudents_dto_1.InviteStudentsDto), studentManagementController.bulkInvite);
router.patch("/students/:studentId/approve", studentManagementController.approveStudent);
router.patch("/students/:studentId/reject", studentManagementController.rejectStudent);
router.patch("/students/:studentId/approve-access", studentManagementController.approveAccessRequest);
exports.default = router;
