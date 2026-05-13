"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toCollegeAdminPersistence = exports.toCollegeAdminEntity = void 0;
const CollegeAdmin_1 = require("@domain/entities/CollegeAdmin");
const toCollegeAdminEntity = (doc) => {
    return CollegeAdmin_1.CollegeAdmin.create({
        id: doc._id.toString(),
        firstName: doc.firstName,
        lastName: doc.lastName,
        email: doc.email,
        password: doc.password,
        orgId: doc.orgId,
        role: doc.role,
        status: doc.status,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
    });
};
exports.toCollegeAdminEntity = toCollegeAdminEntity;
const toCollegeAdminPersistence = (enitity) => {
    const props = enitity.toJSON();
    return {
        firstName: props.firstName,
        lastName: props.lastName,
        email: props.email,
        password: props.password,
        orgId: props.orgId,
        role: props.role,
        status: props.status,
    };
};
exports.toCollegeAdminPersistence = toCollegeAdminPersistence;
