"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComptypeRepository = void 0;
const comptype_model_1 = require("@infrastructure/database/models/comptype/comptype.model");
const comptype_mapper_1 = require("@infrastructure/mappers/comptype.mapper");
const BaseRepository_1 = require("./BaseRepository");
class ComptypeRepository extends BaseRepository_1.BaseRepository {
    constructor() {
        super(comptype_model_1.ComptypeModel);
    }
    toEntity(doc) {
        return (0, comptype_mapper_1.toComptypeEntity)(doc);
    }
    toPersistence(entity) {
        return (0, comptype_mapper_1.toComptypePersistence)(entity);
    }
    async findByName(name) {
        const doc = await this.model.findOne({ name, isDeleted: { $ne: true } });
        return doc ? this.toEntity(doc) : null;
    }
    async searchCompanies(query, page, limit) {
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
            companies: docs.map((doc) => this.toEntity(doc)),
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
exports.ComptypeRepository = ComptypeRepository;
