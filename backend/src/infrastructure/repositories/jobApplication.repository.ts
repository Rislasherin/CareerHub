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

  private buildDateMatch(companyId: string, startDate?: Date, endDate?: Date): any {
    const match: any = { companyId: new Types.ObjectId(companyId) };
    if (startDate || endDate) {
      match.appliedAt = {};
      if (startDate) match.appliedAt.$gte = startDate;
      if (endDate) match.appliedAt.$lte = endDate;
    }
    return match;
  }

  async getHRFunnelStats(companyId: string, startDate?: Date, endDate?: Date): Promise<{ label: string, value: number, color: string }[]> {
    const match = this.buildDateMatch(companyId, startDate, endDate);
    const result = await this.model.aggregate([
      { $match: match },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    
    const countMap = new Map(result.map(r => [r._id, r.count]));
    return [
      { label: "Applied", value: countMap.get(JobApplicationStatus.APPLIED) || 0, color: "bg-blue-500" },
      { label: "Under Review", value: countMap.get(JobApplicationStatus.UNDER_REVIEW) || 0, color: "bg-indigo-500" },
      { label: "Shortlisted", value: countMap.get(JobApplicationStatus.SHORTLISTED) || 0, color: "bg-purple-500" },
      { label: "Interviewing", value: countMap.get(JobApplicationStatus.INTERVIEWING) || 0, color: "bg-emerald-500" },
      { label: "Offered/Hired", value: (countMap.get(JobApplicationStatus.OFFERED) || 0) + (countMap.get(JobApplicationStatus.HIRED) || 0), color: "bg-green-500" }
    ];
  }

  async getApplicationsThisWeek(companyId: string): Promise<number[]> {
    const today = new Date();
    const oneWeekAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6);
    
    const result = await this.model.aggregate([
      { 
        $match: { 
          companyId: new Types.ObjectId(companyId),
          appliedAt: { $gte: oneWeekAgo } 
        } 
      },
      {
        $group: {
          _id: { $dayOfWeek: "$appliedAt" },
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Day of week in Mongo is 1 (Sunday) to 7 (Saturday)
    // We want to return an array of 7 elements corresponding to the last 7 days.
    const counts = [0, 0, 0, 0, 0, 0, 0];
    const todayDay = today.getDay(); // 0 (Sun) to 6 (Sat)
    
    for (const r of result) {
      const dbDay = r._id - 1; // Convert to 0-6
      let diff = todayDay - dbDay;
      if (diff < 0) diff += 7;
      const index = 6 - diff;
      counts[index] = r.count;
    }
    
    return counts;
  }

  async countUniqueCandidates(companyId: string): Promise<number> {
    const result = await this.model.distinct("studentId", { companyId: new Types.ObjectId(companyId) });
    return result.length;
  }

  async countApplicationsInDateRange(companyId: string, startDate?: Date, endDate?: Date): Promise<number> {
    return this.model.countDocuments(this.buildDateMatch(companyId, startDate, endDate)).exec();
  }

  async getApplicationsByMonth(companyId: string, startDate?: Date, endDate?: Date): Promise<{ month: string, count: number }[]> {
    const match = this.buildDateMatch(companyId, startDate, endDate);
    const result = await this.model.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            year: { $year: "$appliedAt" },
            month: { $month: "$appliedAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return result.map(r => ({
      month: `${monthNames[r._id.month - 1]} ${r._id.year}`,
      count: r.count
    }));
  }

  async getApplicationsByJobRole(companyId: string, startDate?: Date, endDate?: Date): Promise<{ role: string, count: number, percentage: number }[]> {
    const match = this.buildDateMatch(companyId, startDate, endDate);
    const result = await this.model.aggregate([
      { $match: match },
      {
        $lookup: {
          from: "jobs",
          localField: "jobId",
          foreignField: "_id",
          as: "job"
        }
      },
      { $unwind: "$job" },
      {
        $group: {
          _id: "$job.title",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const total = result.reduce((acc, r) => acc + r.count, 0);
    return result.map(r => ({
      role: r._id,
      count: r.count,
      percentage: total > 0 ? Math.round((r.count / total) * 100) : 0
    }));
  }

  async getTopCollegesApplied(companyId: string, startDate?: Date, endDate?: Date): Promise<{ collegeName: string, applicationCount: number }[]> {
    const match = this.buildDateMatch(companyId, startDate, endDate);
    const result = await this.model.aggregate([
      { $match: match },
      {
        $lookup: {
          from: "students",
          localField: "studentId",
          foreignField: "_id",
          as: "student"
        }
      },
      { $unwind: "$student" },
      { $match: { "student.collegeId": { $exists: true, $nin: [null, ""] } } },
      {
        $addFields: {
          collegeObjId: { $toObjectId: "$student.collegeId" }
        }
      },
      {
        $lookup: {
          from: "organizations",
          localField: "collegeObjId",
          foreignField: "_id",
          as: "college"
        }
      },
      { $unwind: "$college" },
      {
        $group: {
          _id: "$college.name",
          applicationCount: { $sum: 1 }
        }
      },
      { $sort: { applicationCount: -1 } },
      { $limit: 5 }
    ]);

    return result.map(r => ({
      collegeName: r._id,
      applicationCount: r.applicationCount
    }));
  }

  async getAverageTimeToHire(companyId: string, startDate?: Date, endDate?: Date): Promise<number | null> {
    const match = this.buildDateMatch(companyId, startDate, endDate);
    match.status = JobApplicationStatus.HIRED;
    const result = await this.model.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          avgTime: { $avg: { $subtract: ["$updatedAt", "$appliedAt"] } }
        }
      }
    ]);
    if (result.length > 0 && result[0].avgTime != null) {
      return Math.round(result[0].avgTime / (1000 * 60 * 60 * 24));
    }
    return null;
  }

  async getAverageCandidateScore(companyId: string, startDate?: Date, endDate?: Date): Promise<number | null> {
    const match: any = { companyId: { $in: [companyId, new Types.ObjectId(companyId)] }, overallScore: { $ne: null } };
    if (startDate || endDate) {
      match.createdAt = {};
      if (startDate) match.createdAt.$gte = startDate;
      if (endDate) match.createdAt.$lte = endDate;
    }
    const result = await this.model.db.collection('aiinterviewevaluations').aggregate([
      { $match: match },
      { $group: { _id: null, avgScore: { $avg: "$overallScore" } } }
    ]).toArray();
    if (result.length > 0 && result[0].avgScore != null) {
      return Math.round(result[0].avgScore);
    }
    return null;
  }
}
