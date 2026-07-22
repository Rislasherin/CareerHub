export interface IRewriteEntireResumeUseCase {
    execute(resumeId: string, targetRole: string): Promise<Record<string, unknown>>;
}
