"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentRepository = void 0;
const BaseRepository_1 = require("@infrastructure/repositories/BaseRepository");
const student_model_1 = require("@infrastructure/database/models/student.model");
const student_mapper_1 = require("@infrastructure/mappers/student.mapper");
class StudentRepository extends BaseRepository_1.BaseRepository {
    constructor() {
        super(student_model_1.StudentModel);
    }
    toEntity(doc) {
        return (0, student_mapper_1.toStudentEntity)(doc);
    }
    toPersistence(entity) {
        return (0, student_mapper_1.toStudentPersistence)(entity);
    }
    async findByEmail(email) {
        const doc = await this.model.findOne({ email });
        return doc ? this.toEntity(doc) : null;
    }
    async existsByEmail(email) {
        const exists = await this.model.exists({ email });
        return Boolean(exists);
    }
}
exports.StudentRepository = StudentRepository;
