"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InterviewerModel = void 0;
const mongoose_1 = require("mongoose");
const interviewer_schema_1 = require("@infrastructure/database/schema/interviewer.schema");
exports.InterviewerModel = (0, mongoose_1.model)("Interviewer", interviewer_schema_1.interviewerSchema);
