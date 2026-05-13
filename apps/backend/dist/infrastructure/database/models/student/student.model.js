"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentModel = void 0;
const mongoose_1 = require("mongoose");
const student_schema_1 = require("@infrastructure/database/schema/student/student.schema");
exports.StudentModel = mongoose_1.models.Student || (0, mongoose_1.model)("Student", student_schema_1.studentSchema);
