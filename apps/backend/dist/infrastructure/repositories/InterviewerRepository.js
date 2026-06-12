"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InterviewerRepository = void 0;
const interviewer_model_1 = require("@infrastructure/database/models/company/interviewer.model");
const interviewer_mapper_1 = require("@application/mappers/interviewer.mapper");
const BaseRepository_1 = require("./BaseRepository");
class InterviewerRepository extends BaseRepository_1.BaseRepository {
    constructor() {
        super(interviewer_model_1.InterviewerModel);
    }
    toEntity(doc) {
        return (0, interviewer_mapper_1.toInterviewerEntity)(doc);
    }
    toPersistence(entity) {
        return (0, interviewer_mapper_1.toInterviewerPersistence)(entity);
    }
    async findByEmail(email) {
        const doc = await this.model.findOne({ email, isDeleted: { $ne: true } });
        return doc ? this.toEntity(doc) : null;
    }
    async findByCompanyId(companyId) {
        const docs = await this.model.find({ companyId, isDeleted: { $ne: true } });
        return docs.map((doc) => this.toEntity(doc));
    }
    async searchInterviewers(companyId, query, page, limit, includeDeleted = false) {
        const skip = (page - 1) * limit;
        const filter = {
            companyId,
            $or: [
                { firstName: { $regex: query, $options: "i" } },
                { lastName: { $regex: query, $options: "i" } },
                { email: { $regex: query, $options: "i" } },
            ],
        };
        if (includeDeleted) {
            filter.isDeleted = true;
        }
        else {
            filter.isDeleted = { $ne: true };
        }
        const [docs, total] = await Promise.all([
            this.model.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
            this.model.countDocuments(filter),
        ]);
        return {
            interviewers: docs.map((doc) => this.toEntity(doc)),
            total,
        };
    }
    async searchAllInterviewers(query, page, limit) {
        const skip = (page - 1) * limit;
        const filter = {
            isDeleted: { $ne: true },
            $or: [
                { firstName: { $regex: query, $options: "i" } },
                { lastName: { $regex: query, $options: "i" } },
                { email: { $regex: query, $options: "i" } },
            ],
        };
        const [docs, total] = await Promise.all([
            this.model.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
            this.model.countDocuments(filter),
        ]);
        return {
            interviewers: docs.map((doc) => this.toEntity(doc)),
            total,
        };
    }
    async updateStatus(id, status, blockedBy) {
        const update = { status };
        if (status?.toUpperCase() === 'BLOCKED' && blockedBy) {
            update.blockedBy = blockedBy;
        }
        else if (status?.toUpperCase() !== 'BLOCKED') {
            update.blockedBy = null;
        }
        await this.model.updateOne({ _id: id }, { $set: update });
    }
    async findDeletedById(id) {
        const doc = await this.model.findOne({ _id: id, isDeleted: true }).exec();
        return doc ? this.toEntity(doc) : null;
    }
    async restore(id) {
        await this.model.findByIdAndUpdate(id, { isDeleted: false });
    }
}
exports.InterviewerRepository = InterviewerRepository;
