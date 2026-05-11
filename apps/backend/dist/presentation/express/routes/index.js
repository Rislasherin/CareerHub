"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const student_auth_router_1 = __importDefault(require("./auth/student.auth.router"));
const routes_constants_1 = require("@shared/constants/routes.constants");
const router = (0, express_1.Router)();
router.use(routes_constants_1.ROUTES.AUTH.BASE, student_auth_router_1.default);
exports.default = router;
