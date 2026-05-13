"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentRepository = void 0;
const BaseRepository_1 = require("@infrastructure/repositories/BaseRepository");
const student_model_1 = require("@infrastructure/database/models/student/student.model");
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
    async findByOrgIdAndStatus(orgId, status) {
        const docs = await this.model.find({ collegeId: orgId, status });
        return docs.map((doc) => this.toEntity(doc));
    }
    async updateStatus(id, status) {
        await this.model.findByIdAndUpdate(id, { status });
    }
    async searchAllStudents(query, page, limit) {
        const skip = (page - 1) * limit;
        const filter = {
            $or: [
                { firstName: { $regex: query, $options: "i" } },
                { lastName: { $regex: query, $options: "i" } },
                { email: { $regex: query, $options: "i" } },
            ],
        };
        const [docs, total] = await Promise.all([
            this.model.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
            this.model.countDocuments(filter),
        ]);
        return {
            students: docs.map((doc) => this.toEntity(doc)),
            total,
        };
    }
    async findByInvitationToken(token) {
        const doc = await this.model.findOne({ invitationToken: token });
        return doc ? this.toEntity(doc) : null;
    }
}
exports.StudentRepository = StudentRepository;
