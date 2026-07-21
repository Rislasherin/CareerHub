export interface IRewriteEntireResumeUseCase {
    execute(studentId: string, targetRole: string): Promise<any>;
}
