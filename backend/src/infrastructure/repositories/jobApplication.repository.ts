import { IJobApplicationRepository } from "@domain/repositories/IJobApplicationRepository";
import { JobApplication, JobApplicationProps } from "@domain/entities/JobApplication";
import { BaseRepository } from "./BaseRepository";
import { JobApplicationModel, IJobApplicationDocument } from "../database/models/jobApplication.model";
import { Types } from "mongoose";
import { JobApplicationStatus } from "@domain/enums/JobApplicationStatus.enum";

export class JobApplicationRepository
  extends BaseRepository<JobApplication, IJobApplicationDocument>
  implements IJobApplicationRepository
{
  constructor() {
    super(JobApplicationModel);
  }

  protected toEntity(doc: IJobApplicationDocument): JobApplication {
    return JobApplication.create({
      id: doc._id.toString(),
      jobId: doc.jobId.toString(),
      studentId: doc.studentId.toString(),
      companyId: doc.companyId.toString(),
      resumeUrl: doc.resumeUrl,
      resumeId: doc.resumeId,
      status: doc.status as JobApplicationStatus,
      hrNotes: doc.hrNotes,
      appliedAt: doc.appliedAt,
      updatedAt: doc.updatedAt,
      currentRoundNumber: doc.currentRoundNumber,
    });
  }

  protected toPersistence(entity: JobApplication): Partial<IJobApplicationDocument> {
    const props = entity.toJSON();
    return {
      jobId: props.jobId as unknown as Types.ObjectId,
      studentId: props.studentId as unknown as Types.ObjectId,
      companyId: props.companyId as unknown as Types.ObjectId,
      resumeUrl: props.resumeUrl,
      resumeId: props.resumeId,
      status: props.status,
      hrNotes: props.hrNotes,
      currentRoundNumber: props.currentRoundNumber,
    };
  }

  async findByJobId(jobId: string): Promise<JobApplication[]> {
    const docs = await this.model.find({ jobId }).exec();
    return docs.map((doc) => this.toEntity(doc));
  }

  async findByStudentId(studentId: string): Promise<JobApplication[]> {
    const docs = await this.model.find({ studentId }).exec();
    return docs.map((doc) => this.toEntity(doc));
  }

  async countByStudentIdSince(studentId: string, since: Date): Promise<number> {
    return this.model.countDocuments({
      studentId,
      appliedAt: { $gte: since },
    }).exec();
  }

  async findByJobAndStudent(jobId: string, studentId: string): Promise<JobApplication | null> {
    const doc = await this.model.findOne({ jobId, studentId }).exec();
    if (!doc) return null;
    return this.toEntity(doc);
  }
}
