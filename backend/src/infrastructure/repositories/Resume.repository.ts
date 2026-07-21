import { IResumeRepository } from "@domain/repositories/AI/IResumeRepository";
import { Resume } from "@domain/entities/AI/resume.entity";
import { ResumeDocument, ResumeModel } from "@infrastructure/database/models/student/resume.model";
import { ResumeMapper } from "@application/mappers/resume.mapper";
import { BaseRepository } from "./BaseRepository";

export class ResumeRepository extends BaseRepository<Resume, ResumeDocument> implements IResumeRepository {

    constructor() {
        super(ResumeModel)
    }

    protected toEntity(doc: ResumeDocument): Resume {
        return ResumeMapper.toDomain(doc)
    }
    protected toPersistence(entity: Resume): Record<string, unknown> {
        return ResumeMapper.toPersistence(entity)
    }

    async findByStudentId(studentId: string): Promise<Resume | null> {
        const raw = await ResumeModel.findOne({ studentId });
        if (!raw) return null;
        return ResumeMapper.toDomain(raw);
    }

    async save(resume: Resume): Promise<void> {
        const raw = ResumeMapper.toPersistence(resume);
        if (resume.id) {
            await ResumeModel.findByIdAndUpdate(resume.id, raw, { new: true });
        } else {
            await ResumeModel.create(raw);
        }
    }

}

