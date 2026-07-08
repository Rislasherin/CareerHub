import { IJobApplicationRepository } from "@domain/repositories/IJobApplicationRepository";
import { JobApplication, JobApplicationProps } from "@domain/entities/JobApplication";
import { BaseRepository } from "./BaseRepository";
import { JobApplicationModel, IJobApplicationDocument } from "../database/models/jobApplication.model";
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
    });
  }

  protected toPersistence(entity: JobApplication): Partial<IJobApplicationDocument> {
    const props = entity.toJSON();
    return {
      jobId: props.jobId as any,
      studentId: props.studentId as any,
      companyId: props.companyId as any,
      resumeUrl: props.resumeUrl,
      resumeId: props.resumeId,
      status: props.status,
      hrNotes: props.hrNotes,
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
