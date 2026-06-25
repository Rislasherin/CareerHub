"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentRepository = void 0;
const BaseRepository_1 = require("@infrastructure/repositories/BaseRepository");
const student_model_1 = require("@infrastructure/database/models/student/student.model");
const student_mapper_1 = require("@application/mappers/student.mapper");
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
        const doc = await this.model.findOne({
            email: { $regex: new RegExp(`^${email}$`, 'i') },
            isDeleted: { $ne: true }
        });
        return doc ? this.toEntity(doc) : null;
    }
    async existsByEmail(email) {
        const exists = await this.model.exists({
            email: { $regex: new RegExp(`^${email}$`, 'i') },
            isDeleted: { $ne: true }
        });
        return Boolean(exists);
    }
    async findByOrgIdAndStatus(orgId, status) {
        const docs = await this.model.find({ collegeId: orgId, status, isDeleted: { $ne: true } });
        return docs.map((doc) => this.toEntity(doc));
    }
    async updateStatus(id, status, blockedBy) {
        const update = { status };
        if (status === 'BLOCKED' && blockedBy) {
            update.blockedBy = blockedBy;
        }
        else if (status !== 'BLOCKED') {
            update.blockedBy = null;
        }
        await this.model.updateOne({ _id: id }, { $set: update });
    }
    async searchAllStudents(query, page, limit, collegeId) {
        const skip = (page - 1) * limit;
        const filter = {
            isDeleted: { $ne: true },
            $or: [
                { firstName: { $regex: query, $options: "i" } },
                { lastName: { $regex: query, $options: "i" } },
                { email: { $regex: query, $options: "i" } },
            ],
        };
        if (collegeId) {
            filter.collegeId = collegeId;
        }
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
        const doc = await this.model.findOne({ invitationToken: token, isDeleted: { $ne: true } });
        return doc ? this.toEntity(doc) : null;
    }
}
exports.StudentRepository = StudentRepository;
