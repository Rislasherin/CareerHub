"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobRepository = void 0;
const JobStatus_enum_1 = require("@domain/enums/JobStatus.enum");
const job_model_1 = require("@infrastructure/database/models/company/job.model");
const job_mapper_1 = require("@application/mappers/job.mapper");
const BaseRepository_1 = require("./BaseRepository");
class JobRepository extends BaseRepository_1.BaseRepository {
    constructor() {
        super(job_model_1.JobModel);
    }
    toEntity(doc) {
        return (0, job_mapper_1.toJobEntity)(doc);
    }
    toPersistence(entity) {
        return (0, job_mapper_1.toJobPersistence)(entity);
    }
    async findByCompanyId(companyId) {
        const docs = await this.model.find({ companyId, isDeleted: { $ne: true } }).sort({ createdAt: -1 });
        return docs.map((doc) => this.toEntity(doc));
    }
    async findByCollegeIdAndStatus(collegeId, status) {
        let query = { isDeleted: { $ne: true } };
        if (status === JobStatus_enum_1.JobStatus.PENDING_REVIEW) {
            query.$or = [
                { collegeId, status: JobStatus_enum_1.JobStatus.PENDING_REVIEW },
                {
                    collegeId: "ALL",
                    status: JobStatus_enum_1.JobStatus.PENDING_REVIEW,
                    approvedColleges: { $ne: collegeId },
                    rejectedColleges: { $ne: collegeId }
                }
            ];
        }
        else if (status === JobStatus_enum_1.JobStatus.APPROVED) {
            query.$or = [
                { collegeId, status: JobStatus_enum_1.JobStatus.APPROVED },
                { collegeId: "ALL", approvedColleges: collegeId }
            ];
        }
        else if (status === JobStatus_enum_1.JobStatus.REJECTED) {
            query.$or = [
                { collegeId, status: JobStatus_enum_1.JobStatus.REJECTED },
                { collegeId: "ALL", rejectedColleges: collegeId }
            ];
        }
        else {
            query.$or = [
                { collegeId },
                { collegeId: "ALL" }
            ];
            query.status = status;
        }
        const docs = await this.model.find(query).sort({ createdAt: -1 });
        return docs.map((doc) => this.toEntity(doc));
    }
    async searchJobs(filters, page, limit) {
        const filter = { isDeleted: { $ne: true } };
        if (filters.collegeId) {
            filter.$or = [
                { collegeId: filters.collegeId },
                { collegeId: "ALL" }
            ];
        }
        if (filters.companyId) {
            filter.companyId = filters.companyId;
        }
        if (filters.status) {
            filter.status = filters.status;
        }
        if (filters.searchQuery) {
            filter.$or = [
                { title: { $regex: filters.searchQuery, $options: "i" } },
                { category: { $regex: filters.searchQuery, $options: "i" } },
                { location: { $regex: filters.searchQuery, $options: "i" } },
                { description: { $regex: filters.searchQuery, $options: "i" } },
                { requiredSkills: { $regex: filters.searchQuery, $options: "i" } }
            ];
        }
        const skip = (page - 1) * limit;
        const [docs, total] = await Promise.all([
            this.model.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
            this.model.countDocuments(filter)
        ]);
        return {
            jobs: docs.map((doc) => this.toEntity(doc)),
            total
        };
    }
}
exports.JobRepository = JobRepository;
