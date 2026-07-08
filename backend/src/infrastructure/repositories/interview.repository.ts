import { Interview } from "@domain/entities/Interview";
import { BaseRepository } from "./BaseRepository";
import { InterviewDocument, InterviewModel } from "@infrastructure/database/models/company/interview.model";
import { toInterviewEntity, toInterviewPersistence } from "@application/mappers/interview.mapper";
import { IInterviewRepository } from "@domain/repositories/IInterviewRepository";

export class InterviewRepository extends BaseRepository<Interview, InterviewDocument>
    implements IInterviewRepository {
    constructor() {
        super(InterviewModel)
    }

    protected toEntity(doc: InterviewDocument): Interview {
        return toInterviewEntity(doc);
    }
    protected toPersistence(entity: Interview): Record<string, unknown> {
        return toInterviewPersistence(entity);
    }

    async findByApplicationId(applicationId: string): Promise<Interview[]> {
        const docs = await this.model.find({ applicationId, isDeleted: { $ne: true } }).sort({ scheduledAt: 1 });
        return docs.map(doc => this.toEntity(doc as InterviewDocument));
    }

    async findByInterviewerId(interviewerId: string): Promise<Interview[]> {
        const docs = await this.model.find({ interviewerId, isDeleted: { $ne: true } }).sort({ scheduledAt: 1 });

        return docs.map(doc => this.toEntity(doc as InterviewDocument))
    }
    async findByJobId(jobId:string):Promise<Interview[]> {
        const doc = await this.model.find({jobId,isDeleted:{$ne:true}}).sort({scheduledAt:1});

        return doc.map(doc =>this.toEntity(doc as InterviewDocument))
    }

}