import { ResumeMetadata } from "@domain/entities/student";

export interface IUploadResumeUseCase {
    execute(studentId:string,file:Express.Multer.File): Promise<ResumeMetadata | undefined>;
}