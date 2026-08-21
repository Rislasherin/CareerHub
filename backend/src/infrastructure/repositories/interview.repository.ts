import { Interview } from "@domain/entities/Interview";
import { BaseRepository } from "./BaseRepository";
import { InterviewDocument, InterviewModel } from "@infrastructure/database/models/company/interview.model";
import { IInterviewRepository } from "@domain/repositories/IInterviewRepository";
import { InterviewSchema } from "@infrastructure/database/schema/company/interview.schema";
import { toInterviewEntity, toInterviewPersistence } from "@application/mappers/interview.mapper";
import { SheduleInterviewDto } from "@application/dtos/hr/Request/ScheduleInterview.dto";

export class InterviewRepository extends BaseRepository<Interview,InterviewDocument> implements IInterviewRepository {
    constructor(){
        super(InterviewModel);
    }

    protected toEntity(doc: InterviewDocument): Interview {
        return toInterviewEntity(doc)
    }
    protected toPersistence(entity: Interview): Record<string, unknown> {
        return toInterviewPersistence(entity)
    }

    async save(interview: Interview): Promise<Interview> {
        return this.update(interview.id, interview)
    }

    async findByStudentId(studentId: string): Promise<Interview[]> {
        const docs = await this.model
        .find({studentId,isDeleted: {$ne: true}})
        .sort({scheduledAt: -1});

        return docs.map(doc => this.toEntity(doc as InterviewDocument));
    }

    async findByJobId(jobId: string): Promise<Interview[]> {
        const docs = await this.model
        .find({jobId, isDeleted: {$ne: true}})
        .sort({scheduledAt: -1})

        return docs.map(doc => this.toEntity(doc as InterviewDocument))
    }
    async findByCompanyId(companyId: string): Promise<Interview[]> {
        const docs = await this.model
        .find({companyId, isDeleted: {$ne: true}})
        .sort({scheduledAt: -1})

        return docs.map(doc => this.toEntity(doc as InterviewDocument))
    }
}