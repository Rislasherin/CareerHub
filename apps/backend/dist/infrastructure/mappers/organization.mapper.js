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
        status: props.status
    };
};
exports.toOrganizationPersistence = toOrganizationPersistence;
