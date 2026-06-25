"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const student_factory_1 = require("@infrastructure/di/student.factory");
const infra_container_1 = require("@infrastructure/di/infra.container");
const validateDto_1 = require("@presentation/express/middlewares/validateDto");
const UpdateStudentProfile_dto_1 = require("@application/dtos/student/UpdateStudentProfile.dto");
const multer_1 = __importDefault(require("multer"));
const router = (0, express_1.Router)();
const studentController = (0, student_factory_1.makeStudentController)();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
// Use authMiddleware.protect for all routes in this router
router.use(infra_container_1.authMiddleware.protect);
router.get("/me", studentController.getMe);
router.post("/verify", upload.single('file'), studentController.uploadVerification);
router.get("/profile", studentController.getProfile);
router.put("/profile", (0, validateDto_1.validateDto)(UpdateStudentProfile_dto_1.UpdateStudentProfileDto), studentController.updateProfile);
router.get("/jobs", studentController.getJobs);
router.post("/jobs/:id/apply", studentController.applyJob);
exports.default = router;
