import { IJobMatchReport } from "@application/interfaces/IAIService";

export interface IMatchJobDescriptionUseCase {
    execute(resumeId: string, jobDescription: string): Promise<IJobMatchReport>;
}
