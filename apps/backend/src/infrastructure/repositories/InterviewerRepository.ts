import { Interviewer } from "@domain/entities/Interviewer";
import { IInterviewerRepository } from "@domain/repositories/IInterviewerRepository";
import { InterviewerDocument, InterviewerModel } from "@infrastructure/database/models/company/interviewer.model";
import { toInterviewerEntity, toInterviewerPersistence } from "@application/mappers/interviewer.mapper";
import { FilterQuery } from "mongoose";
import { BaseRepository } from "./BaseRepository";
import { interviewerRepository } from "@infrastructure/di/infra.container";
import { UserStatus } from "@domain/enums/user.status.enum";

export class InterviewerRepository
  extends BaseRepository<Interviewer, InterviewerDocument>
  implements IInterviewerRepository {
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
    const doc = await this.model.findOne({ email, isDeleted: { $ne: true } });
    return doc ? this.toEntity(doc as InterviewerDocument) : null;
  }

  async findByCompanyId(companyId: string): Promise<Interviewer[]> {
    const docs = await this.model.find({ companyId, isDeleted: { $ne: true } });
    return docs.map((doc) => this.toEntity(doc as InterviewerDocument));
  }

  async searchInterviewers(companyId: string, query: string, page: number, limit: number, includeDeleted: boolean = false): Promise<{ interviewers: Interviewer[], total: number }> {
    const skip = (page - 1) * limit;
    const filter: FilterQuery<InterviewerDocument> = {
      companyId,
      $or: [
        { firstName: { $regex: query, $options: "i" } },
        { lastName: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
      ],
    };

    if (includeDeleted) {
      filter.isDeleted = true;
    } else {
      filter.isDeleted = { $ne: true };
    }

    const [docs, total] = await Promise.all([
      this.model.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
      this.model.countDocuments(filter),
    ]);

    return {
      interviewers: docs.map((doc) => this.toEntity(doc as InterviewerDocument)),
      total,
    };
  }

  async searchAllInterviewers(query: string, page: number, limit: number): Promise<{ interviewers: Interviewer[], total: number }> {
    const skip = (page - 1) * limit;
    const filter = {
      isDeleted: { $ne: true },
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

  async updateStatus(id: string, status: string, blockedBy?: string): Promise<void> {
    const update: Record<string, unknown> = { status };
    if (status?.toUpperCase() === 'BLOCKED' && blockedBy) {
      update.blockedBy = blockedBy;
    } else if (status?.toUpperCase() !== 'BLOCKED') {
      update.blockedBy = null;
    }
    await this.model.updateOne({ _id: id }, { $set: update });
  }

  async findDeletedById(id: string): Promise<Interviewer | null> {
    const doc = await this.model.findOne({ _id: id, isDeleted: true }).exec();
    return doc ? this.toEntity(doc as InterviewerDocument) : null;
  }

  async restore(id: string): Promise<void> {
    await this.model.findByIdAndUpdate(id, { isDeleted: false });
  }
}
