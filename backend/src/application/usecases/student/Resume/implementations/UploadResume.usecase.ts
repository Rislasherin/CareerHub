import { IStorageService } from "@application/interfaces/IStorageService";
import { StudentRepository } from "@infrastructure/repositories/student.repository";
import { IUploadResumeUseCase } from "../interfaces/IUploadResume.usecase";
import { ResumeMetadata, Student } from "@domain/entities/student";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";


export class UploadResumeUseCase implements IUploadResumeUseCase {
    constructor(
        private _studentRepository: StudentRepository,
        private _storageService: IStorageService
    ) { }

    async execute(studentId: string, file: Express.Multer.File): Promise<ResumeMetadata | undefined> {
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
                console.warn('Could not delete old file from Cloudinary, proceeding with upload:', error);
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
        return updatedStudent?.resume

    }

}