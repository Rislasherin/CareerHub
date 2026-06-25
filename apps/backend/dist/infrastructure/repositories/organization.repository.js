"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationRepository = void 0;
const BaseRepository_1 = require("./BaseRepository");
const organization_mapper_1 = require("@application/mappers/organization.mapper");
const organization_model_1 = require("@infrastructure/database/models/organizer/organization.model");
class OrganizationRepository extends BaseRepository_1.BaseRepository {
    constructor() {
        super(organization_model_1.OrganizationModel);
    }
    toEntity(doc) {
        return (0, organization_mapper_1.toOrganizationEntity)(doc);
    }
    toPersistence(entity) {
        return (0, organization_mapper_1.toOrganizationPersistence)(entity);
    }
    async findByName(name) {
        const doc = await this.model.findOne({ name, isDeleted: { $ne: true } });
        return doc ? this.toEntity(doc) : null;
    }
    async searchOrganizations(query, page, limit) {
        const skip = (page - 1) * limit;
        const filter = {
            name: { $regex: query, $options: "i" },
            isDeleted: { $ne: true }
        };
        const [docs, total] = await Promise.all([
            this.model.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
            this.model.countDocuments(filter),
        ]);
        return {
            organizations: docs.map((doc) => this.toEntity(doc)),
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
}
exports.OrganizationRepository = OrganizationRepository;
