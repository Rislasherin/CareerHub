"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollegeAdminRepository = void 0;
const BaseRepository_1 = require("./BaseRepository");
const college_admin_model_1 = require("@infrastructure/database/models/organizer/college-admin.model");
const college_admin_mapper_1 = require("@infrastructure/mappers/college-admin.mapper");
class CollegeAdminRepository extends BaseRepository_1.BaseRepository {
    constructor() {
        super(college_admin_model_1.CollegeAdminModel);
    }
    toEntity(doc) {
        return (0, college_admin_mapper_1.toCollegeAdminEntity)(doc);
    }
    toPersistence(entity) {
        return (0, college_admin_mapper_1.toCollegeAdminPersistence)(entity);
    }
    async findByEmail(email) {
        const doc = await this.model.findOne({ email, isDeleted: { $ne: true } });
        return doc ? this.toEntity(doc) : null;
    }
    async findByOrgId(orgId) {
        const doc = await this.model.findOne({ orgId, isDeleted: { $ne: true } });
        return doc ? this.toEntity(doc) : null;
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
}
exports.CollegeAdminRepository = CollegeAdminRepository;
