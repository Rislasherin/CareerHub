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
        const doc = await this.model.findOne({ email });
        return doc ? this.toEntity(doc)
            : null;
    }
}
exports.CollegeAdminRepository = CollegeAdminRepository;
