"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComptypeRepository = void 0;
const comptype_entity_1 = require("@domain/entities/comptype.entity");
const comptype_model_1 = require("@infrastructure/database/models/comptype.model");
class ComptypeRepository {
    async create(comptype) {
        const created = await comptype_model_1.ComptypeModel.create({
            name: comptype.getName(),
            size: comptype.getSize(),
            industry: comptype.getIndustry(),
            primaryContactName: comptype.getPrimaryContactName(),
            primaryContactEmail: comptype.getPrimaryContactEmail(),
            primaryContactPhone: comptype.getPrimaryContactPhone(),
        });
        return comptype_entity_1.ComptypeEntity.create({
            id: created._id.toString(),
            name: created.name,
            size: created.size,
            industry: created.industry,
            primaryContactName: created.primaryContactName,
            primaryContactEmail: created.primaryContactEmail,
            primaryContactPhone: created.primaryContactPhone,
        });
    }
    async findByName(name) {
        const document = await comptype_model_1.ComptypeModel.findOne({ name }).exec();
        if (!document) {
            return null;
        }
        return comptype_entity_1.ComptypeEntity.create({
            id: document._id.toString(),
            name: document.name,
            size: document.size,
            industry: document.industry,
            primaryContactName: document.primaryContactName,
            primaryContactEmail: document.primaryContactEmail,
            primaryContactPhone: document.primaryContactPhone,
        });
    }
}
exports.ComptypeRepository = ComptypeRepository;
