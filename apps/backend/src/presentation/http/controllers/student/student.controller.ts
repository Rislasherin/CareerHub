import { Request, Response } from "express";
import { asyncHandler } from "@shared/utils/asyncHandler.util";
import { sendSuccess } from "@shared/utils/response.util";
import { IUploadStudentVerificationUseCase } from "@application/usecases/auth/student/implementations/UploadStudentVerification.usecase";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";

export class StudentController {
  constructor(
    private readonly _uploadVerificationUseCase: IUploadStudentVerificationUseCase
  ) {}

  uploadVerification = asyncHandler(async (req: any, res: Response) => {
    const studentId = req.user?.id;
    if (!studentId) {
      throw new AppError("Student ID not found in session", HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
    }

    const file = req.file;
    if (!file) {
      throw new AppError("Verification document is required", HttpStatus.BAD_REQUEST, ErrorCode.INTERNAL_ERROR);
    }

    const student = await this._uploadVerificationUseCase.execute(studentId, file);
    sendSuccess(res, student.toJSON(), "Verification details uploaded successfully. Please wait for admin review.");
  });

  getMe = asyncHandler(async (req: any, res: Response) => {
    // Return current student info (handled by auth middleware)
    sendSuccess(res, req.user, "Student profile retrieved");
  });
}
