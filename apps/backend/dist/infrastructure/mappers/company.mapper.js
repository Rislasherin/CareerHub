"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toCompanyPersistence = exports.toCompanyEntity = void 0;
const Company_1 = require("@domain/entities/Company");
const toCompanyEntity = (doc) => {
    return Company_1.Company.create({
        id: doc._id.toString(),
        name: doc.name,
        sector: doc.sector ?? undefined,
        size: doc.size ?? undefined,
        location: doc.location ?? undefined,
        contactName: doc.contactName ?? undefined,
        contactEmail: doc.contactEmail ?? undefined,
        contactPhone: doc.contactPhone ?? undefined,
        onboardingStep: doc.onboardingStep,
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
        sector: props.sector,
        size: props.size,
        location: props.location,
        contactName: props.contactName,
        contactEmail: props.contactEmail,
        contactPhone: props.contactPhone,
        onboardingStep: props.onboardingStep,
        status: props.status,
    };
};
exports.toCompanyPersistence = toCompanyPersistence;
