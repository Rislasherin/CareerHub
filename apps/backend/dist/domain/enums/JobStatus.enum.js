"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobStatus = void 0;
var JobStatus;
(function (JobStatus) {
    JobStatus["PENDING_REVIEW"] = "pending_review";
    JobStatus["APPROVED"] = "approved";
    JobStatus["REJECTED"] = "rejected";
    JobStatus["ACTIVE"] = "active";
    JobStatus["CLOSED"] = "closed";
})(JobStatus || (exports.JobStatus = JobStatus = {}));
