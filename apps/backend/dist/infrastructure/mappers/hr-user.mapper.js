"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toHRUserPersistence = exports.toHRUserEntity = void 0;
const HRUser_1 = require("@domain/entities/HRUser");
const toHRUserEntity = (doc) => {
    return HRUser_1.HRUser.create({
        id: doc._id.toString(),
        companyId: doc.companyId,
        firstName: doc.firstName,
        lastName: doc.lastName,
        email: doc.email,
        password: doc.password,
        designation: doc.designation,
        role: doc.role,
        status: doc.status,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
    });
};
exports.toHRUserEntity = toHRUserEntity;
const toHRUserPersistence = (entity) => {
    const props = entity.toJSON();
    return {
        companyId: props.companyId,
        firstName: props.firstName,
        lastName: props.lastName,
        email: props.email,
        password: props.password,
        designation: props.designation,
        role: props.role,
        status: props.status,
    };
};
exports.toHRUserPersistence = toHRUserPersistence;
