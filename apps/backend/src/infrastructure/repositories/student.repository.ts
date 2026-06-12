import { IStudentRepository } from "@domain/repositories/IStudentRepository";
import { Student } from "@domain/entities/student";
import { BaseRepository } from "@infrastructure/repositories/BaseRepository";
import { StudentDocument, StudentModel } from "@infrastructure/database/models/student/student.model";
import { toStudentEntity, toStudentPersistence } from "@application/mappers/student.mapper";
import { FilterQuery } from "mongoose";

export class StudentRepository extends BaseRepository<Student, StudentDocument> implements IStudentRepository {
  constructor() {
    super(StudentModel);
  }

  protected toEntity(doc: StudentDocument): Student {
    return toStudentEntity(doc);
  }


  protected toPersistence(entity: Student): Record<string, unknown> {
    return toStudentPersistence(entity);
  }

  async findByEmail(email: string): Promise<Student | null> {
    const doc = await this.model.findOne({ 
      email: { $regex: new RegExp(`^${email}$`, 'i') },
      isDeleted: { $ne: true }
    });
    return doc ? this.toEntity(doc as StudentDocument) : null;
  }

  async existsByEmail(email: string): Promise<boolean> {
    const exists = await this.model.exists({ 
      email: { $regex: new RegExp(`^${email}$`, 'i') },
      isDeleted: { $ne: true }
    });
    return Boolean(exists);
  }

  async findByOrgIdAndStatus(orgId: string, status: string): Promise<Student[]> {
    const docs = await this.model.find({ collegeId: orgId, status, isDeleted: { $ne: true } });
    return docs.map((doc) => this.toEntity(doc as StudentDocument));
  }

  async updateStatus(id: string, status: string, blockedBy?: string): Promise<void> {
    const update: Record<string, unknown> = { status };
    if (status === 'BLOCKED' && blockedBy) {
      update.blockedBy = blockedBy;
    } else if (status !== 'BLOCKED') {
      update.blockedBy = null;
    }
    await this.model.updateOne({ _id: id }, { $set: update });
  }

  async searchAllStudents(query: string, page: number, limit: number, collegeId?: string): Promise<{ students: Student[], total: number }> {
    const skip = (page - 1) * limit;
    const filter: FilterQuery<StudentDocument> = {
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
      students: docs.map((doc) => this.toEntity(doc as StudentDocument)),
      total,
    };
  }
   async findByInvitationToken(token: string): Promise<Student | null> {
    const doc = await this.model.findOne({ invitationToken: token, isDeleted: { $ne: true } });
    return doc ? this.toEntity(doc as StudentDocument) : null;
  }

  
}
