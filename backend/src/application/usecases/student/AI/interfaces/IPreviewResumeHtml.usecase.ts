export interface IPreviewResumeHtmlUseCase {
    execute(resumeId: string, templateId?: string): Promise<string>;
}
