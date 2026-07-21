import { Resume} from "@domain/entities/AI/resume.entity";

export interface IResumeRepository {
  findById(id: string): Promise<Resume | null>;
  findByStudentId(studentId: string): Promise<Resume | null>;
  save(resume: Resume): Promise<void>;
}
