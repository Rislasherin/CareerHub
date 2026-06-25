"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toCompanyPersistence = exports.toCompanyEntity = void 0;
const Company_1 = require("@domain/entities/Company");
const toCompanyEntity = (doc) => {
    return Company_1.Company.create({
        id: doc._id.toString(),
        name: doc.name,
        industry: doc.industry ?? undefined,
        sector: doc.sector ?? undefined,
        size: doc.size ?? undefined,
        location: doc.location ?? undefined,
        headquarters: doc.headquarters ?? undefined,
        website: doc.website ?? undefined,
        description: doc.description ?? undefined,
        contactName: doc.contactName ?? undefined,
        contactEmail: doc.contactEmail ?? undefined,
        contactPhone: doc.contactPhone ?? undefined,
        contactJobTitle: doc.contactJobTitle ?? undefined,
        logoUrl: doc.logoUrl ?? undefined,
        preferredColleges: doc.preferredColleges ?? [],
        onboardingStep: doc.onboardingStep || 0,
        status: doc.status,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
    });
};
exports.toCompanyEntity = toCompanyEntity;
const toCompanyPersistence = (entity) => {
    const props = entity.toJSON();
    return {
        name: props.name,
        industry: props.industry,
        sector: props.sector,
        size: props.size,
        location: props.location,
        headquarters: props.headquarters,
        website: props.website,
        description: props.description,
        contactName: props.contactName,
        contactEmail: props.contactEmail,
        contactPhone: props.contactPhone,
        contactJobTitle: props.contactJobTitle,
        logoUrl: props.logoUrl,
        preferredColleges: props.preferredColleges,
        onboardingStep: props.onboardingStep,
        status: props.status,
    };
};
exports.toCompanyPersistence = toCompanyPersistence;
