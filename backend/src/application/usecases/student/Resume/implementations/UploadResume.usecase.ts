import { IStorageService } from "@application/interfaces/IStorageService";
import { StudentRepository } from "@infrastructure/repositories/student.repository";
import { IUploadResumeUseCase, IUploadResumeResponse } from "../interfaces/IUploadResume.usecase";
import { IParseResumeUseCase } from "../../AI/interfaces/IParseResume.usecase";
import { ResumeMetadata, Student } from "@domain/entities/student";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { Logger, LogCategory } from '../../../../../infrastructure/logger/logger';

export class UploadResumeUseCase implements IUploadResumeUseCase {
    constructor(
        private _studentRepository: StudentRepository,
        private _storageService: IStorageService,
        private _parseResumeUseCase: IParseResumeUseCase
    ) { }

    async execute(studentId: string, file: Express.Multer.File): Promise<IUploadResumeResponse> {
        if (!file || file.mimetype !== 'application/pdf') {
            throw new AppError('Only PDF files are allowed', HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
        }
        if (file.size > 5 * 1024 * 1024) {
            throw new AppError('File size exceeds 5MB limit', HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
        }

        const student = await this._studentRepository.findById(studentId);
        if(!student) throw new AppError('Student not found', HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);

        if(student.resume?.publicId) {
            try {
                await this._storageService.deleteFile(student.resume.publicId);
            } catch (error) {
                Logger.warn(LogCategory.SYSTEM_INFO, 'Could not delete old file from Cloudinary, proceeding with upload:', error);
            }
        }

        const uploadResult = await this._storageService.uploadFileWithMetadata(file,'resumes');

        const updatedProps = student.toJSON();

        updatedProps.resume = {
            url: uploadResult.url,
            publicId: uploadResult.publicId,
            fileName: file.originalname,
            fileSize: uploadResult.bytes,
            uploadDate: new Date()
        };
        const studentToUpdate = Student.create(updatedProps);
        const updatedStudent = await this._studentRepository.update(studentId,studentToUpdate);
        
        // Parse the resume for AI Data Sync
        let parsedData = null;
        try {
            parsedData = await this._parseResumeUseCase.execute(studentId, file.buffer, file.mimetype);
        } catch (error) {
            Logger.warn(LogCategory.SYSTEM_INFO, 'Failed to parse resume with AI, continuing without parsed data', error);
        }

        return {
            resume: updatedStudent?.resume,
            parsedData: parsedData
        };

    }

}