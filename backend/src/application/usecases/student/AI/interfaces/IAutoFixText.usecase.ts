export interface IAutoFixTextUseCase {
    execute(text: string, targetRole: string): Promise<string>;
}
