"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuperAdminRepository = void 0;
const super_admin_model_1 = require("@infrastructure/database/models/superadmin/super-admin.model");
const super_admin_mapper_1 = require("@application/mappers/super-admin.mapper");
const BaseRepository_1 = require("./BaseRepository");
class SuperAdminRepository extends BaseRepository_1.BaseRepository {
    constructor() {
        super(super_admin_model_1.SuperAdminModel);
    }
    toEntity(doc) {
        return (0, super_admin_mapper_1.toSuperAdminEntity)(doc);
    }
    toPersistence(entity) {
        return (0, super_admin_mapper_1.toSuperAdminPersistence)(entity);
    }
    async findByEmail(email) {
        const doc = await this.model.findOne({ email });
        return doc ? this.toEntity(doc) : null;
    }
}
exports.SuperAdminRepository = SuperAdminRepository;
