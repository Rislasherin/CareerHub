"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HRUserRepository = void 0;
const hr_user_model_1 = require("@infrastructure/database/models/company/hr-user.model");
const hr_user_mapper_1 = require("@application/mappers/hr-user.mapper");
const BaseRepository_1 = require("./BaseRepository");
class HRUserRepository extends BaseRepository_1.BaseRepository {
    constructor() {
        super(hr_user_model_1.HRUserModel);
    }
    toEntity(doc) {
        return (0, hr_user_mapper_1.toHRUserEntity)(doc);
    }
    toPersistence(entity) {
        return (0, hr_user_mapper_1.toHRUserPersistence)(entity);
    }
    async findByEmail(email) {
        const doc = await this.model.findOne({ email });
        return doc ? this.toEntity(doc) : null;
    }
    async findByCompanyId(companyId) {
        const docs = await this.model.find({ companyId });
        return docs.map((doc) => this.toEntity(doc));
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
    async searchHRUsers(query, page, limit) {
        const skip = (page - 1) * limit;
        const filter = {
            $or: [
                { firstName: { $regex: query, $options: "i" } },
                { lastName: { $regex: query, $options: "i" } },
                { email: { $regex: query, $options: "i" } }
            ],
            isDeleted: { $ne: true }
        };
        const [docs, total] = await Promise.all([
            this.model.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
            this.model.countDocuments(filter),
        ]);
        return {
            hrUsers: docs.map((doc) => this.toEntity(doc)),
            total,
        };
    }
}
exports.HRUserRepository = HRUserRepository;
