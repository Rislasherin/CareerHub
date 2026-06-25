import { AppError } from "@application/errors/AppError";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
  }
}

export class InvalidCredentialsError extends AppError {
  constructor() {
    super("Invalid email or password", HttpStatus.UNAUTHORIZED, ErrorCode.INVALID_CREDENTIALS);
  }
}

export class TokenInvalidError extends AppError {
  constructor() {
    super("Token is invalid", HttpStatus.UNAUTHORIZED, ErrorCode.TOKEN_INVALID);
  }
}

export class TokenExpiredCustomError extends AppError {
  constructor() {
    super("Token has expired", HttpStatus.UNAUTHORIZED, ErrorCode.TOKEN_EXPIRED);
  }
}
