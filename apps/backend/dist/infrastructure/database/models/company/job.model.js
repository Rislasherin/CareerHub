"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobModel = void 0;
const mongoose_1 = require("mongoose");
const job_schema_1 = require("@infrastructure/database/schema/comptype/job.schema");
exports.JobModel = mongoose_1.models.Job || (0, mongoose_1.model)("Job", job_schema_1.JobSchema);
