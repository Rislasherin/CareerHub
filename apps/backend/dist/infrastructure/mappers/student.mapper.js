"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toStudentPersistence = exports.toStudentEntity = void 0;
const student_1 = require("@domain/entities/student");
const toStudentEntity = (doc) => {
    return student_1.Student.create({
        id: doc._id.toString(),
        name: doc.name,
        email: doc.email,
        password: doc.password,
        status: doc.status,
        collegeId: doc.collegeId ?? undefined,
        isFirstLogin: doc.isFirstLogin,
    });
};
exports.toStudentEntity = toStudentEntity;
const toStudentPersistence = (entity) => {
    const props = entity.toJSON();
    return {
        name: props.name,
        email: props.email,
        password: props.password,
        status: props.status,
        collegeId: props.collegeId,
        isFirstLogin: props.isFirstLogin,
    };
};
exports.toStudentPersistence = toStudentPersistence;
