"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toInterviewerPersistence = exports.toInterviewerEntity = void 0;
const Interviewer_1 = require("@domain/entities/Interviewer");
const toInterviewerEntity = (doc) => {
    return Interviewer_1.Interviewer.create({
        id: doc._id.toString(),
        comptypeId: doc.comptypeId,
        firstName: doc.firstName,
        lastName: doc.lastName,
        email: doc.email,
        password: doc.password,
        designation: doc.designation,
        specialization: doc.specialization,
        role: doc.role,
        status: doc.status,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
        isDeleted: doc.isDeleted || false,
    });
};
exports.toInterviewerEntity = toInterviewerEntity;
const toInterviewerPersistence = (entity) => {
    const props = entity.toJSON();
    return {
        comptypeId: props.comptypeId,
        firstName: props.firstName,
        lastName: props.lastName,
        email: props.email,
        password: props.password,
        designation: props.designation,
        specialization: props.specialization,
        role: props.role,
        status: props.status,
        isDeleted: props.isDeleted || false,
    };
};
exports.toInterviewerPersistence = toInterviewerPersistence;
