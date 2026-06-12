"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toOrganizationPersistence = exports.toOrganizationEntity = void 0;
const Organization_1 = require("@domain/entities/Organization");
const toOrganizationEntity = (doc) => {
    return Organization_1.Organization.create({
        id: doc._id.toString(),
        name: doc.name,
        city: doc.city || '',
        state: doc.state || '',
        studentCountRange: doc.studentCountRange || '',
        shortName: doc.shortName || undefined,
        yearEstablished: doc.yearEstablished || undefined,
        address: doc.address || undefined,
        naacGrade: doc.naacGrade || undefined,
        placementCellName: doc.placementCellName || undefined,
        placementContactEmail: doc.placementContactEmail || undefined,
        placementContactPhone: doc.placementContactPhone || undefined,
        activeBranches: doc.activeBranches || [],
        currentAcademicYear: doc.currentAcademicYear || undefined,
        activePlacementBatch: doc.activePlacementBatch || undefined,
        plan: doc.plan || undefined,
        logoUrl: doc.logoUrl || undefined,
        onboardingStep: doc.onboardingStep || 0,
        website: doc.website || undefined,
        status: doc.status,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt
    });
};
exports.toOrganizationEntity = toOrganizationEntity;
const toOrganizationPersistence = (entity) => {
    const props = entity.toJSON();
    return {
        name: props.name,
        city: props.city,
        state: props.state,
        studentCountRange: props.studentCountRange,
        shortName: props.shortName,
        yearEstablished: props.yearEstablished,
        address: props.address,
        naacGrade: props.naacGrade,
        placementCellName: props.placementCellName,
        placementContactEmail: props.placementContactEmail,
        placementContactPhone: props.placementContactPhone,
        activeBranches: props.activeBranches,
        currentAcademicYear: props.currentAcademicYear,
        activePlacementBatch: props.activePlacementBatch,
        plan: props.plan,
        logoUrl: props.logoUrl,
        onboardingStep: props.onboardingStep,
        website: props.website,
        status: props.status
    };
};
exports.toOrganizationPersistence = toOrganizationPersistence;
