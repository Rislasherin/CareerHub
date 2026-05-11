import { IStudentRepository } from "@domain/repositories/IStudentRepository";
import { Student } from "@domain/entities/student";
import { BaseRepository } from "@infrastructure/repositories/BaseRepository";
import { StudentDocument, StudentModel } from "@infrastructure/database/models/student/student.model";
import { toStudentEntity, toStudentPersistence } from "@infrastructure/mappers/student.mapper";

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
    const doc = await this.model.findOne({ email });
    return doc ? this.toEntity(doc as StudentDocument) : null;
  }

  async existsByEmail(email: string): Promise<boolean> {
    const exists = await this.model.exists({ email });
    return Boolean(exists);
  }

  async findByOrgIdAndStatus(orgId: string, status: string): Promise<Student[]> {
    const docs = await this.model.find({ collegeId: orgId, status });
    return docs.map((doc) => this.toEntity(doc as StudentDocument));
  }

  async updateStatus(id: string, status: string): Promise<void> {
    await this.model.findByIdAndUpdate(id, { status });
  }

  async searchAllStudents(query: string, page: number, limit: number): Promise<{ students: Student[], total: number }> {
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
      students: docs.map((doc) => this.toEntity(doc as StudentDocument)),
      total,
    };
  }
}
