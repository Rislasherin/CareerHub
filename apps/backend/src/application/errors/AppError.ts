import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";

export class AppError extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: HttpStatus,
    public readonly errorCode: ErrorCode
  ) {
    super(message);
  }
}
