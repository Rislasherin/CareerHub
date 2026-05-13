"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HRUserRepository = void 0;
const hr_user_model_1 = require("@infrastructure/database/models/company/hr-user.model");
const hr_user_mapper_1 = require("@infrastructure/mappers/hr-user.mapper");
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
}
exports.HRUserRepository = HRUserRepository;
