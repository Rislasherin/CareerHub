"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationRepository = void 0;
const organization_entity_1 = require("@domain/entities/organization.entity");
const organization_model_1 = require("@infrastructure/database/models/organization.model");
class OrganizationRepository {
    async create(organization) {
        const created = await organization_model_1.OrganizationModel.create({
            name: organization.getName(),
            shortName: organization.getShortName(),
            collegeType: organization.getCollegeType(),
            city: organization.getCity(),
            state: organization.getState(),
            website: organization.getWebsite(),
            placementCellName: organization.getPlacementCellName(),
            activeBatch: organization.getActiveBatch(),
            naacGrade: organization.getNaacGrade(),
        });
        return organization_entity_1.OrganizationEntity.create({
            id: created._id.toString(),
            name: created.name,
            shortName: created.shortName,
            collegeType: created.collegeType,
            city: created.city,
            state: created.state,
            website: created.website ?? undefined,
            placementCellName: created.placementCellName ?? undefined,
            activeBatch: created.activeBatch ?? undefined,
            naacGrade: created.naacGrade ?? undefined,
        });
    }
    async findByName(name) {
        const document = await organization_model_1.OrganizationModel.findOne({ name }).exec();
        if (!document) {
            return null;
        }
        return organization_entity_1.OrganizationEntity.create({
            id: document._id.toString(),
            name: document.name,
            shortName: document.shortName,
            collegeType: document.collegeType,
            city: document.city,
            state: document.state,
            website: document.website ?? undefined,
            placementCellName: document.placementCellName ?? undefined,
            activeBatch: document.activeBatch ?? undefined,
            naacGrade: document.naacGrade ?? undefined,
        });
    }
}
exports.OrganizationRepository = OrganizationRepository;
