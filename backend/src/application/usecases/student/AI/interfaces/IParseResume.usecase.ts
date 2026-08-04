export interface IParseResumeUseCase {
    execute(studentId: string, fileBuffer: Buffer, mimeType: string): Promise<any>
}