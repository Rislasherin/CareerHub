import { logger } from "@infrastructure/logger/logger";
import { IStudentRepository } from "@domain/repositories/IStudentRepository";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { IToggleStudentStatusUseCase } from "../interfaces/IToggleStudentStatus.usecase";

export class ToggleStudentStatusUseCase implements IToggleStudentStatusUseCase {
    constructor(private readonly studentRepo: IStudentRepository) { }

    async execute(studentId: string, status: string, adminRole?: string): Promise<void> {
        logger.info(`USECASE: Toggling student ${studentId} to ${status} by ${adminRole}`);
        const student = await this.studentRepo.findById(studentId);
        if (!student) {
            logger.info(`USECASE Error: Student ${studentId} not found`);
            throw new AppError("Student not found", HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
        }

        logger.info(`USECASE: Current status is ${(student as unknown as { status: string }).status}, setting to ${status}`);
        await this.studentRepo.updateStatus(studentId, status, adminRole);
        logger.info(`USECASE: Update command sent for ${studentId}`);
    }
}

