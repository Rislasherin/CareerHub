import { AtsReport } from "@application/services/ats/types/ats.types";

export interface IAnalyzeResumeUseCase {
    execute(resumeId: string): Promise<AtsReport>
}