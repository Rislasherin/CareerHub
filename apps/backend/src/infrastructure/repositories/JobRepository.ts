import { Job } from "@domain/entities/Job";
import { JobStatus } from "@domain/enums/JobStatus.enum";
import { IJobRepository } from "@domain/repositories/IJobRepository";
import { JobDocument, JobModel } from "@infrastructure/database/models/company/job.model";
import { toJobEntity, toJobPersistence } from "@application/mappers/job.mapper";
import { FilterQuery } from "mongoose";
import { BaseRepository } from "./BaseRepository";
import { UserStatus } from "@domain/enums/user.status.enum";

export class JobRepository extends BaseRepository<Job, JobDocument> implements IJobRepository {
  constructor() {
    super(JobModel);
  }

  protected toEntity(doc: JobDocument): Job {
    return toJobEntity(doc);
  }

  protected toPersistence(entity: Job): Record<string, unknown> {
    return toJobPersistence(entity);
  }

  async findByCompanyId(companyId: string): Promise<Job[]> {
    const docs = await this.model.find({ companyId, isDeleted: { $ne: true } }).sort({ createdAt: -1 });
    return docs.map((doc) => this.toEntity(doc as JobDocument));
  }

  async findByCollegeIdAndStatus(collegeId: string, status: JobStatus): Promise<Job[]> {
    let query: FilterQuery<JobDocument> = { isDeleted: { $ne: true } };

    if (status === JobStatus.PENDING_REVIEW) {
      query.$or = [
        { collegeId, status: JobStatus.PENDING_REVIEW },
        {
          collegeId: "ALL",
          status: { $in: [JobStatus.PENDING_REVIEW, JobStatus.ACTIVE] },
          approvedColleges: { $ne: collegeId },
          rejectedColleges: { $ne: collegeId }
        }
      ];
    } else if (status === JobStatus.APPROVED) {
      query.$or = [
        { collegeId, status: JobStatus.APPROVED },
        { collegeId: "ALL", approvedColleges: collegeId }
      ];
    } else if (status === JobStatus.REJECTED) {
      query.$or = [
        { collegeId, status: JobStatus.REJECTED },
        { collegeId: "ALL", rejectedColleges: collegeId }
      ];
    } else if (status === JobStatus.ACTIVE) {
      query.$or = [
        { collegeId, status: JobStatus.ACTIVE },
        { collegeId: "ALL", status: JobStatus.ACTIVE, approvedColleges: collegeId }
      ];
    } else {
      query.$or = [
        { collegeId },
        { collegeId: "ALL" }
      ];
      query.status = status;
    }

    const docs = await this.model.find(query).sort({ createdAt: -1 });
    return docs.map((doc) => this.toEntity(doc as JobDocument));
  }

  async searchJobs(
    filters: {
      collegeId?: string;
      companyId?: string;
      status?: JobStatus;
      searchQuery?: string;
    },
    page: number,
    limit: number
  ): Promise<{ jobs: Job[]; total: number }> {
    const filter: FilterQuery<JobDocument> = { isDeleted: { $ne: true } };

    if (filters.collegeId) {
      filter.$or = [
        { collegeId: filters.collegeId },
        { collegeId: "ALL" }
      ];
    }
    if (filters.companyId) {
      filter.companyId = filters.companyId;
    }
    if (filters.status) {
      filter.status = filters.status;
    }
    if (filters.searchQuery) {
      filter.$or = [
        { title: { $regex: filters.searchQuery, $options: "i" } },
        { category: { $regex: filters.searchQuery, $options: "i" } },
        { location: { $regex: filters.searchQuery, $options: "i" } },
        { description: { $regex: filters.searchQuery, $options: "i" } },
        { requiredSkills: { $regex: filters.searchQuery, $options: "i" } }
      ];
    }

    const skip = (page - 1) * limit;
    const [docs, total] = await Promise.all([
      this.model.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
      this.model.countDocuments(filter)
    ]);

    return {
      jobs: docs.map((doc) => this.toEntity(doc as JobDocument)),
      total
    };
  }
}



