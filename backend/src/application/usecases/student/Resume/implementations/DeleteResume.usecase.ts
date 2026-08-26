import { IStorageService } from "@application/interfaces/IStorageService";
import { StudentRepository } from "@infrastructure/repositories/student.repository";
import { IDeleteResumeUseCase } from "../interfaces/IDeleteResume.usecase";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { Student } from "@domain/entities/student";
import { Logger, LogCategory } from '../../../../../infrastructure/logger/logger';

export class DeleteResumeUseCase implements IDeleteResumeUseCase {
    constructor(
        private _studentRepository: StudentRepository,
        private _storageService: IStorageService
    ) { }

    async execute(studentId: string): Promise<void> {
        const student = await this._studentRepository.findById(studentId);
        if (!student) {
            throw new AppError('No resume found to delete', HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
        }
        try {
            await this._storageService.deleteFile(student.resume!.publicId);
        } catch (error) {
            Logger.warn(LogCategory.SYSTEM_INFO, 'Could not delete file from Cloudinary, proceeding to clear DB:', error);
        }
        
        const updatedProps = student.toJSON();
        updatedProps.resume = undefined;
        
        const studentToUpdate = Student.create(updatedProps);
        await this._studentRepository.update(studentId, studentToUpdate);
    }
}