"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bcryptService = exports.jwtService = exports.studentRepository = void 0;
const student_repository_1 = require("@infrastructure/repositories/student.repository");
const bcrypt_service_1 = require("@infrastructure/services/hash/bcrypt.service");
const jwt_service_1 = require("@infrastructure/services/token/jwt.service");
exports.studentRepository = new student_repository_1.StudentRepository();
exports.jwtService = new jwt_service_1.JwtService();
exports.bcryptService = new bcrypt_service_1.BcryptService();
