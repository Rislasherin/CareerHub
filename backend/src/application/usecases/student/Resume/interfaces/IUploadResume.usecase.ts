import { ResumeMetadata } from "@domain/entities/student";

export interface IUploadResumeResponse {
    resume?: ResumeMetadata;
    parsedData?: any;
}

export interface IUploadResumeUseCase {
    execute(studentId:string,file:Express.Multer.File): Promise<IUploadResumeResponse>;
}