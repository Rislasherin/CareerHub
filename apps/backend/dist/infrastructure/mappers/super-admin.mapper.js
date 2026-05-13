"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toSuperAdminPersistence = exports.toSuperAdminEntity = void 0;
const SuperAdmin_1 = require("@domain/entities/SuperAdmin");
const toSuperAdminEntity = (doc) => {
    return SuperAdmin_1.SuperAdmin.create({
        id: doc._id.toString(),
        firstName: doc.firstName,
        lastName: doc.lastName,
        email: doc.email,
        password: doc.password,
        role: doc.role,
        status: doc.status,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
    });
};
exports.toSuperAdminEntity = toSuperAdminEntity;
const toSuperAdminPersistence = (entity) => {
    const props = entity.toJSON();
    return {
        firstName: props.firstName,
        lastName: props.lastName,
        email: props.email,
        password: props.password,
        role: props.role,
        status: props.status,
    };
};
exports.toSuperAdminPersistence = toSuperAdminPersistence;
