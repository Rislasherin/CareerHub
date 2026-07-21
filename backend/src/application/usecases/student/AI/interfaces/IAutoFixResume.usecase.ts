export interface IAutoFixResumeUseCase {
    execute(text: string, targetRole: string): Promise<string>;
}
