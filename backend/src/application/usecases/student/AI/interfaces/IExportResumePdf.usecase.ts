export interface IExportResumePdfUseCase {
    execute(resumeId: string): Promise<Buffer>;
}
