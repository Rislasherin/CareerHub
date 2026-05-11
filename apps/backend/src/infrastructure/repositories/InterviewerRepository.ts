import { Interviewer } from "@domain/entities/Interviewer";
import { IInterviewerRepository } from "@domain/repositories/IInterviewerRepository";
import { InterviewerDocument, InterviewerModel } from "@infrastructure/database/models/company/interviewer.model";
import { toInterviewerEntity, toInterviewerPersistence } from "@infrastructure/mappers/interviewer.mapper";
import { BaseRepository } from "./BaseRepository";

export class InterviewerRepository
  extends BaseRepository<Interviewer, InterviewerDocument>
  implements IInterviewerRepository
{
  constructor() {
    super(InterviewerModel);
  }

  protected toEntity(doc: InterviewerDocument): Interviewer {
    return toInterviewerEntity(doc);
  }

  protected toPersistence(entity: Interviewer): Record<string, unknown> {
    return toInterviewerPersistence(entity);
  }

  async findByEmail(email: string): Promise<Interviewer | null> {
    const doc = await this.model.findOne({ email });
    return doc ? this.toEntity(doc as InterviewerDocument) : null;
  }

  async findByCompanyId(companyId: string): Promise<Interviewer[]> {
    const docs = await this.model.find({ companyId });
    return docs.map((doc) => this.toEntity(doc as InterviewerDocument));
  }

  async searchInterviewers(companyId: string, query: string, page: number, limit: number): Promise<{ interviewers: Interviewer[], total: number }> {
    const skip = (page - 1) * limit;
    const filter = {
      companyId,
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
      interviewers: docs.map((doc) => this.toEntity(doc as InterviewerDocument)),
      total,
    };
  }

  async update(entity: Interviewer): Promise<Interviewer> {
    const props = this.toPersistence(entity);
    const updated = await this.model.findByIdAndUpdate(entity.id, props, { new: true });
    return this.toEntity(updated as InterviewerDocument);
  }

  async searchAllInterviewers(query: string, page: number, limit: number): Promise<{ interviewers: Interviewer[], total: number }> {
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
      interviewers: docs.map((doc) => this.toEntity(doc as InterviewerDocument)),
      total,
    };
  }
}
