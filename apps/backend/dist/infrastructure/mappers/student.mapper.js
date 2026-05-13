"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toStudentPersistence = exports.toStudentEntity = void 0;
const student_1 = require("@domain/entities/student");
const toStudentEntity = (doc) => {
    return student_1.Student.create({
        id: doc._id.toString(),
        firstName: doc.firstName,
        lastName: doc.lastName,
        email: doc.email,
        password: doc.password || '',
        status: doc.status,
        collegeId: doc.collegeId,
        proofUrl: doc.proofUrl || undefined,
        isFirstLogin: doc.isFirstLogin,
        rollNumber: doc.rollNumber || undefined,
        department: doc.department || undefined,
        phoneNumber: doc.phoneNumber || undefined,
        invitationToken: doc.invitationToken || undefined,
        invitationExpiresAt: doc.invitationExpiresAt || undefined,
        createdAt: doc.createdAt || undefined,
        updatedAt: doc.updatedAt || undefined,
    });
};
exports.toStudentEntity = toStudentEntity;
const toStudentPersistence = (entity) => {
    const props = entity.toJSON();
    return {
        firstName: props.firstName,
        lastName: props.lastName,
        email: props.email,
        password: props.password,
        status: props.status,
        collegeId: props.collegeId,
        proofUrl: props.proofUrl,
        isFirstLogin: props.isFirstLogin,
        rollNumber: props.rollNumber,
        department: props.department,
        phoneNumber: props.phoneNumber,
        invitationToken: props.invitationToken,
        invitationExpiresAt: props.invitationExpiresAt,
    };
};
exports.toStudentPersistence = toStudentPersistence;
