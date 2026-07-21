import { IAIService } from "@application/interfaces/IAIService";
import { IParseResumeUseCase } from "@application/usecases/student/AI/interfaces/IParseResume.usecase";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { logger } from "@infrastructure/logger/logger";

export class ParseResumeUseCase implements IParseResumeUseCase {
    constructor(
        private readonly _aiService: IAIService
    ){}

    async execute(studentId: string, fileBuffer: Buffer, mimeType: string): Promise<any> {
        if(!fileBuffer) {
            throw new AppError("File buffer is required", HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
        }

        try {
            const extractedData = await this._aiService.extractResumeFromDocument(fileBuffer,mimeType);

            return extractedData
        } catch (error) {
            logger.error("Error in ParseResumeUseCase:", error);
            throw new AppError("Failed to parse resume document", HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.INTERNAL_ERROR);
        }
    }
}